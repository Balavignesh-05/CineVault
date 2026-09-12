import Image from 'next/image';
import { SeriesDetailsData } from '@/lib/tmdb/types';
import { RatingStars } from '@/components/movie/RatingStars';
import { Badge } from '@/components/ui/badge';
import { SeriesActions } from '@/components/series/SeriesActions';

interface SeriesHeroProps {
  series: SeriesDetailsData;
}

export function SeriesHero({ series }: SeriesHeroProps) {
  const backdropUrl = series.backdropPath ? `https://image.tmdb.org/t/p/w1280${series.backdropPath}` : null;
  const posterUrl = series.posterPath ? `https://image.tmdb.org/t/p/w500${series.posterPath}` : null;

  const yearRange = series.firstAirDate 
    ? `${new Date(series.firstAirDate).getFullYear()} - ${series.status === 'Ended' && series.lastAirDate ? new Date(series.lastAirDate).getFullYear() : 'Present'}`
    : 'Unknown';

  return (
    <div className="relative w-full min-h-[70vh] flex items-end">
      {backdropUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backdropUrl}
            alt={`${series.title} backdrop`}
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
                  alt={series.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div className="self-start">
                <Badge variant="outline" className="border-[#3D3D55] text-muted-foreground bg-[var(--color-bg-surface)]/50 backdrop-blur">
                  TV Series
                </Badge>
                {series.status === 'Ended' && (
                  <Badge variant="outline" className="border-[#3D3D55] text-muted-foreground bg-[var(--color-bg-surface)]/50 backdrop-blur ml-2">
                    Ended
                  </Badge>
                )}
              </div>
              
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                  {series.title}
                </h1>
                {series.tagline && (
                  <p className="text-xl text-[var(--color-accent-secondary)] italic mt-2 font-medium">
                    &ldquo;{series.tagline}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                <span>{yearRange}</span>
                <span className="w-1 h-1 rounded-full bg-[#3D3D55]" />
                <span>{series.numberOfSeasons} {series.numberOfSeasons === 1 ? 'Season' : 'Seasons'}</span>
                <span className="w-1 h-1 rounded-full bg-[#3D3D55]" />
                <span>{series.numberOfEpisodes} Episodes</span>
                
                {series.genres.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#3D3D55]" />
                    <div className="flex flex-wrap gap-2">
                      {series.genres.map(g => (
                        <span key={g.id} className="text-foreground">{g.name}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                <RatingStars value={series.voteAverage} readonly size="md" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-white">{series.voteAverage.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                  <span className="text-xs text-muted-foreground ml-2">({series.voteCount.toLocaleString()} votes)</span>
                </div>
              </div>
              
              <div className="mt-2 text-foreground/90 max-w-2xl line-clamp-3 text-lg leading-relaxed">
                {series.overview}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 z-20">
              <SeriesActions 
                seriesId={series.id} 
                seriesTitle={series.title} 
                posterPath={series.posterPath}
                firstAirYear={series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : undefined}
              /> 
          </div>
        </div>
      </div>
    </div>
  );
}
