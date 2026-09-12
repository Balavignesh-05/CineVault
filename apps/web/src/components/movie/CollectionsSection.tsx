'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

interface CollectionPart {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface CollectionsSectionProps {
  collection: Collection | null;
  currentMovieId: number;
}

export function CollectionsSection({ collection, currentMovieId }: CollectionsSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['collection', collection?.id],
    queryFn: () =>
      fetch(`/api/tmdb/collection/${collection!.id}`)
        .then(r => r.json())
        .then(d => d.data as { parts: CollectionPart[]; name: string; overview: string; poster_path: string | null; backdrop_path: string | null })
        .catch(() => null),
    enabled: !!collection,
  });

  if (!collection) return null;
  if (isLoading) return null; // Silent loading

  const parts = data?.parts?.sort((a, b) => {
    const aYear = a.release_date ? new Date(a.release_date).getFullYear() : 0;
    const bYear = b.release_date ? new Date(b.release_date).getFullYear() : 0;
    return aYear - bYear;
  }) ?? [];

  if (parts.length <= 1) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="text-accent-amber" size={22} />
          {data?.name || collection.name}
        </h2>
        <span className="text-sm text-text-muted">{parts.length} films</span>
      </div>

      {data?.overview && (
        <p className="text-sm text-text-secondary leading-relaxed">{data.overview}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {parts.map(part => {
          const year = part.release_date ? new Date(part.release_date).getFullYear() : null;
          const isCurrent = part.id === currentMovieId;
          return (
            <Link
              key={part.id}
              href={`/movies/${part.id}`}
              className={`group block rounded-2xl overflow-hidden border transition-all ${
                isCurrent
                  ? 'border-primary ring-2 ring-[#00e054]/30'
                  : 'border-border-subtle hover:border-[#3d4a56]'
              }`}
            >
              <div className="relative aspect-[2/3] bg-surface">
                {part.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${part.poster_path}`}
                    alt={part.title}
                    fill
                    sizes="200px"
                    className={`object-cover transition-transform ${
                      isCurrent ? '' : 'group-hover:scale-105'
                    }`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Film size={32} className="text-[#2c3440]" />
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute inset-0 bg-primary/10 flex items-end">
                    <div className="w-full bg-primary text-[#14181c] text-[10px] font-black text-center py-1">
                      CURRENT
                    </div>
                  </div>
                )}
                {part.vote_average > 0 && !isCurrent && (
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-primary">
                    ★ {part.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="p-2 bg-surface">
                <p className="text-xs font-semibold text-white truncate">{part.title}</p>
                {year && <p className="text-[10px] text-text-muted font-mono">{year}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
