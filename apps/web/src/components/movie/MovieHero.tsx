import Image from 'next/image';
import { MovieDetailsData } from '@/lib/tmdb/types';
import { RatingDisplay } from '@/components/movie/RatingDisplay';
import { RatingStars } from '@/components/movie/RatingStars';
import { Badge } from '@/components/ui/badge';
import { MovieActions } from '@/components/movie/MovieActions';

interface MovieHeroProps {
  movie: MovieDetailsData;
}

export function MovieHero({ movie }: MovieHeroProps) {
  const backdropUrl = movie.backdropPath ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}` : null;
  const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null;

  const runtimeStr = movie.runtime 
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="relative w-full min-h-[70vh] flex items-end">
      {backdropUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-base)] via-[var(--color-bg-base)]/60 to-transparent" />
        </div>
      )}

      <div className="container relative z-10 pb-12 pt-32 w-full">
        <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
          
          <div className="flex flex-col md:flex-row gap-8 items-end w-full md:w-2/3">
            {posterUrl && (
              <div className="relative w-32 md:w-40 aspect-[2/3] rounded-lg overflow-hidden shrink-0 shadow-2xl ring-1 ring-white/10 hidden sm:block">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              {movie.certification && (
                <div className="self-start">
                  <Badge variant="outline" className="border-[#3D3D55] text-muted-foreground bg-[var(--color-bg-surface)]/50 backdrop-blur">
                    {movie.certification}
                  </Badge>
                </div>
              )}
              
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-xl text-text-secondary italic mt-2 font-medium">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {runtimeStr && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#3D3D55]" />
                    <span>{runtimeStr}</span>
                  </>
                )}
                {movie.genres.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#3D3D55]" />
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map(g => (
                        <span key={g.id} className="text-foreground">{g.name}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                <RatingStars value={movie.voteAverage} readonly size="md" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-white">{movie.voteAverage.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                  <span className="text-xs text-muted-foreground ml-2">({movie.voteCount.toLocaleString()} votes)</span>
                </div>
              </div>
              
              <div className="mt-2 text-foreground/90 max-w-2xl line-clamp-3 text-lg leading-relaxed">
                {movie.overview}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 z-20">
            <MovieActions 
              movieId={movie.id} 
              movieTitle={movie.title} 
              posterPath={movie.posterPath} 
              trailerKey={movie.trailer?.key} 
              releaseYear={movie.releaseYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
