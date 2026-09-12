import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMovieDetails, normalizeMovieDetails } from '@/lib/tmdb/client';
import { CastSection } from '@/components/movie/CastSection';
import { CrewSection } from '@/components/movie/CrewSection';
import { MovieDetailsSection } from '@/components/movie/MovieDetailsSection';
import { WatchProvidersSection } from '@/components/movie/WatchProvidersSection';
import { ReviewsSection } from '@/components/movie/ReviewsSection';
import { FansSection } from '@/components/movie/FansSection';
import { MovieActions } from '@/components/movie/MovieActions';
import { SimilarFilmsSection } from '@/components/movie/SimilarFilmsSection';
import { AlertCircle, ArrowLeft, Star, Clock, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-text-muted">
        Invalid movie ID.
      </div>
    );
  }

  let rawMovie: any = null;
  try {
    rawMovie = await getMovieDetails(movieId);
  } catch (err) {
    rawMovie = null;
  }

  if (!rawMovie) {
    return (
      <div className="min-h-screen bg-background py-16 text-white text-center">
        <div className="container mx-auto px-4 max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-error mx-auto opacity-80" />
          <h1 className="text-2xl font-bold">Movie Not Found</h1>
          <p className="text-xs text-text-muted">
            We could not find the requested movie details on TMDB.
          </p>
          <Link
            href="/films"
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={14} /> Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const movie = normalizeMovieDetails(rawMovie);
  const backdropUrl = movie.backdropPath ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}` : null;
  const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null;

  const rawCast = rawMovie.credits?.cast || [];
  const rawCrew = rawMovie.credits?.crew || [];
  const watchProviders = rawMovie['watch/providers']?.results || {};
  const trailerKey = rawMovie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key || null;

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      {/* Hero Backdrop */}
      <div className="relative h-[55vh] min-h-[400px] w-full bg-surface overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={movie.title}
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
                alt={movie.title}
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
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm md:text-base text-accent-amber italic mt-1 font-medium">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {movie.releaseYear && (
                <span className="px-3 py-1 bg-surface border border-border-subtle text-white font-semibold text-xs rounded-full">
                  {movie.releaseYear}
                </span>
              )}
              {movie.genres.map((g) => (
                <span key={g.id} className="px-3 py-1 bg-surface border border-border-subtle text-text-secondary text-xs rounded-full">
                  {g.name}
                </span>
              ))}
              {movie.runtime && (
                <span className="px-3 py-1 bg-surface border border-border-subtle text-text-muted text-xs rounded-full flex items-center gap-1">
                  <Clock size={12} /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.voteAverage > 0 && (
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-primary" /> {movie.voteAverage.toFixed(1)}
                </span>
              )}
            </div>

            {movie.overview && (
               <p className="text-sm md:text-base leading-relaxed text-text-muted max-w-3xl">
                {movie.overview}
              </p>
            )}

            {movie.belongsToCollection && (
              <Link href={`/collections/tmdb/${movie.belongsToCollection.id}`} className="mt-6 block group">
                <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface hover:ring-1 hover:ring-primary transition-all">
                  {movie.belongsToCollection.backdrop_path && (
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${movie.belongsToCollection.backdrop_path}`}
                        alt={movie.belongsToCollection.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                    </div>
                  )}
                  <div className="relative p-4 flex items-center gap-4">
                    {movie.belongsToCollection.poster_path && (
                      <div className="w-12 h-18 rounded shrink-0 overflow-hidden relative">
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${movie.belongsToCollection.poster_path}`}
                          alt={movie.belongsToCollection.name}
                          width={48}
                          height={72}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Part of the</p>
                      <p className="text-white font-bold group-hover:text-primary transition-colors">{movie.belongsToCollection.name}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Actions Column */}
          <div className="w-full md:w-auto shrink-0 md:pl-8 pt-4 md:pt-0">
            <MovieActions
              movieId={movie.id}
              movieTitle={movie.title}
              posterPath={movie.posterPath}
              releaseYear={movie.releaseYear}
              trailerKey={trailerKey || undefined}
            />
          </div>
        </div>

        {/* Cast Section */}
        {rawCast.length > 0 && (
          <CastSection cast={rawCast} director={movie.director} />
        )}

        {/* Crew Section */}
        {rawCrew.length > 0 && (
          <CrewSection crew={rawCrew} />
        )}

        {/* Watch Providers Section */}
        {Object.keys(watchProviders).length > 0 && (
          <WatchProvidersSection providers={watchProviders} movieTitle={movie.title} />
        )}

        {/* Movie Details Breakdown */}
        <MovieDetailsSection movie={movie} />

        {/* Fans Section */}
        <FansSection tmdbId={movie.id} />

        {/* Reviews Section */}
        <ReviewsSection 
          tmdbId={movie.id} 
          title={movie.title} 
          posterPath={movie.posterPath} 
          mediaType="movie" 
        />

        {/* Similar Films */}
        <SimilarFilmsSection movieId={movie.id} />
      </div>
    </div>
  );
}
