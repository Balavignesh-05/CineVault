import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMovieDetails, normalizeMovieDetails } from '@/lib/tmdb/client';
import { MovieStatsBar } from '@/components/movie/MovieStatsBar';
import { WhereToWatchCard } from '@/components/movie/WhereToWatchCard';
import { MovieInfoTabs } from '@/components/movie/MovieInfoTabs';
import { MovieActionPanel } from '@/components/movie/MovieActionPanel';
import { MovieRatingsCard } from '@/components/movie/MovieRatingsCard';
import { ReviewsSection } from '@/components/movie/ReviewsSection';
import { SimilarFilmsSection } from '@/components/movie/SimilarFilmsSection';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) {
    return (
      <div className="min-h-screen bg-[#0B0F14] py-16 text-center text-[#9AA8B7]">
        Invalid movie ID.
      </div>
    );
  }

  let rawMovie: any = null;
  try {
    rawMovie = await getMovieDetails(movieId);
  } catch {
    rawMovie = null;
  }

  if (!rawMovie) {
    return (
      <div className="min-h-screen bg-[#0B0F14] py-16 text-white text-center">
        <div className="container mx-auto px-4 max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto opacity-80" />
          <h1 className="text-2xl font-bold">Movie Not Found</h1>
          <p className="text-xs text-[#9AA8B7]">
            We could not find the requested movie details on TMDB.
          </p>
          <Link
            href="/films"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#35D6A0] text-[#0B0F14] font-black text-xs rounded-xl hover:bg-[#6BE8BC] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const movie = normalizeMovieDetails(rawMovie);
  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const rawCast = rawMovie.credits?.cast || [];
  const rawCrew = rawMovie.credits?.crew || [];
  const watchProviders = rawMovie['watch/providers']?.results || {};
  const trailerKey =
    rawMovie.videos?.results?.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
    )?.key || null;

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#9AA8B7] pb-24 selection:bg-[#35D6A0] selection:text-[#0B0F14]">
      {/* ── Cinematic Hero Backdrop with Vignette ───────────── */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[600px] w-full bg-[#0B0F14] overflow-hidden">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top filter brightness-[0.7] contrast-[1.05]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#131A22] via-[#0B0F14] to-[#0B0F14]" />
        )}
        {/* Layered cinematic vignette and dark fades */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14]/90 via-transparent to-[#0B0F14]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,15,20,0.85)_100%)] pointer-events-none" />
      </div>

      {/* ── Main Container: Three-Column Composition ───────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] -mt-72 sm:-mt-80 relative z-10 space-y-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── COLUMN 1 (LEFT): Poster, Community Stats, Streaming ── */}
          <div className="w-full sm:w-72 lg:w-[260px] xl:w-[280px] shrink-0 mx-auto lg:mx-0 space-y-4">
            {/* Poster Card */}
            <div className="relative aspect-[2/3] w-56 sm:w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-[#273442] bg-[#131A22]">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 1024px) 288px, 280px"
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9AA8B7] p-4 text-center text-xs">
                  No Poster Available
                </div>
              )}
            </div>

            {/* Community Stats Bar */}
            <MovieStatsBar
              voteCount={movie.voteCount}
              popularity={movie.popularity}
            />

            {/* Where to Watch / Streaming Section */}
            <WhereToWatchCard
              providers={watchProviders}
              movieTitle={movie.title}
              trailerKey={trailerKey}
            />
          </div>

          {/* ── COLUMN 2 (CENTER): Title, Director, Synopsis, Tabs ── */}
          <div className="flex-1 min-w-0 space-y-6 pt-1 w-full">
            {/* Title & Metadata Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F4F3EC] tracking-tight">
                  {movie.title}
                </h1>
                {movie.releaseYear && (
                  <Link
                    href={`/films?year=${movie.releaseYear}`}
                    className="text-2xl sm:text-3xl font-medium text-[#9AA8B7] hover:text-[#35D6A0] transition-colors"
                  >
                    {movie.releaseYear}
                  </Link>
                )}
              </div>

              {movie.director && (
                <p className="text-sm sm:text-base text-[#9AA8B7]">
                  Directed by{' '}
                  <Link
                    href={`/person/${movie.director.id}`}
                    className="text-[#F4F3EC] hover:text-[#35D6A0] font-bold underline-offset-4 hover:underline transition-colors"
                  >
                    {movie.director.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-xs sm:text-sm text-[#35D6A0] uppercase tracking-[0.14em] font-bold">
                {movie.tagline}
              </p>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <p className="text-sm sm:text-base text-[#F4F3EC]/90 leading-relaxed font-normal max-w-3xl">
                {movie.overview}
              </p>
            )}

            {/* Part of Collection Banner */}
            {movie.belongsToCollection && (
              <Link
                href={`/collections/tmdb/${movie.belongsToCollection.id}`}
                className="block group"
              >
                <div className="relative overflow-hidden rounded-xl border border-[#273442] bg-[#131A22] hover:border-[#35D6A0]/60 transition-all p-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#9AA8B7] uppercase tracking-wider font-bold">
                      Part of the
                    </p>
                    <p className="text-white font-bold text-sm group-hover:text-[#35D6A0] transition-colors truncate">
                      {movie.belongsToCollection.name}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Information Tabs (CAST | CREW | DETAILS | GENRES | RELEASES) ── */}
            <div className="pt-2">
              <MovieInfoTabs
                cast={rawCast}
                crew={rawCrew}
                movie={movie}
                rawMovie={rawMovie}
              />
            </div>
          </div>

          {/* ── COLUMN 3 (RIGHT): Action Panel & Ratings Summary ── */}
          <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 space-y-5 pt-1">
            {/* Interactive Action Panel */}
            <MovieActionPanel
              movieId={movie.id}
              movieTitle={movie.title}
              posterPath={movie.posterPath}
              releaseYear={movie.releaseYear}
            />

            {/* Ratings & Statistics Card */}
            <MovieRatingsCard
              voteAverage={movie.voteAverage}
              voteCount={movie.voteCount}
              popularity={movie.popularity}
            />
          </div>
        </div>

        {/* ── Community Reviews Section ──────────────────────── */}
        <div className="pt-6 border-t border-[#273442]/60">
          <ReviewsSection
            tmdbId={movie.id}
            title={movie.title}
            posterPath={movie.posterPath}
            mediaType="movie"
          />
        </div>

        {/* ── Similar Films Carousel ──────────────────────────── */}
        <div className="pt-6 border-t border-[#273442]/60">
          <SimilarFilmsSection movieId={movie.id} />
        </div>
      </div>
    </div>
  );
}
