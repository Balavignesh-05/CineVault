'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Film } from 'lucide-react';

interface SimilarFilm {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
}

interface SimilarFilmsSectionProps {
  movieId: number;
}

export function SimilarFilmsSection({ movieId }: SimilarFilmsSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['similar-films', movieId],
    queryFn: async () => {
      const res = await fetch(`/api/tmdb/movies/${movieId}/similar`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).slice(0, 10) as SimilarFilm[];
    },
    staleTime: 3600000,
  });

  if (isLoading) return (
    <section className="space-y-4">
      <h2 className="text-sm font-black text-white uppercase tracking-[0.1em]">Similar Films</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(8)].map((_,i) => (
          <div key={i} className="w-24 aspect-[2/3] bg-surface rounded animate-pulse shrink-0" />
        ))}
      </div>
    </section>
  );

  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-black text-white uppercase tracking-[0.1em]">Similar Films</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {data.map(film => {
          const posterUrl = film.poster_path
            ? `https://image.tmdb.org/t/p/w185${film.poster_path}`
            : null;
          return (
            <Link
              key={film.id}
              href={`/movies/${film.id}`}
              className="group shrink-0 w-24"
            >
              <div className="w-24 aspect-[2/3] bg-surface rounded-lg overflow-hidden">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={16} className="text-text-muted opacity-50" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-text-muted mt-1 line-clamp-2 group-hover:text-white transition-colors">{film.title}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
