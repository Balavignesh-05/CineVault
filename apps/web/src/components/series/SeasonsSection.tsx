import Image from 'next/image';
import Link from 'next/link';
import { TMDBTvSeasonBase } from '@/lib/tmdb/types';

interface SeasonsSectionProps {
  seriesId: number;
  seasons: TMDBTvSeasonBase[];
}

export function SeasonsSection({ seriesId, seasons }: SeasonsSectionProps) {
  if (!seasons || seasons.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-black text-white">Seasons</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {seasons.map(season => {
          const posterUrl = season.poster_path ? `https://image.tmdb.org/t/p/w342${season.poster_path}` : null;
          const year = season.air_date ? new Date(season.air_date).getFullYear() : null;

          return (
            <Link
              key={season.id}
              href={`/series/${seriesId}/season/${season.season_number}`}
              className="group flex flex-col gap-2"
            >
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-surface border border-border-subtle transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(0,224,84,0.15)]">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={season.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <span className="text-text-muted font-bold">{season.name}</span>
                  </div>
                )}
                
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                  {season.episode_count} EPS
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-white text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {season.name}
                </h3>
                {year && <p className="text-xs text-text-muted mt-0.5">{year}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
