'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MovieCardData, SeriesCardData } from '@/lib/tmdb/types';
import { MediaCarousel } from '@/components/media';

interface MediaSectionProps {
  title: string;
  subtitle?: string;
  media?: (MovieCardData | SeriesCardData)[];
  viewAllHref?: string;
  variant?: 'default' | 'dark';
  fetchEndpoint?: string;
}

function normalizeRaw(item: any): MovieCardData {
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    posterPath: item.poster_path || item.posterPath || null,
    backdropPath: item.backdrop_path || item.backdropPath || null,
    releaseYear: item.release_date
      ? parseInt(item.release_date.slice(0, 4))
      : item.first_air_date
      ? parseInt(item.first_air_date.slice(0, 4))
      : null,
    voteAverage: item.vote_average ?? item.voteAverage ?? 0,
    voteCount: item.vote_count ?? item.voteCount ?? 0,
    genreIds: item.genre_ids || item.genreIds || [],
    overview: item.overview || '',
    popularity: item.popularity || 0,
    originalLanguage: item.original_language || item.originalLanguage || 'en',
    mediaType: item.media_type || (item.name ? 'tv' : 'movie'),
  };
}

export function MediaSection({
  title,
  subtitle,
  media,
  viewAllHref,
  variant = 'default',
  fetchEndpoint,
}: MediaSectionProps) {
  const [items, setItems] = useState<(MovieCardData | SeriesCardData)[]>(media || []);
  const [loading, setLoading] = useState<boolean>(!media || media.length === 0);
  const [error, setError] = useState<boolean>(false);

  const fetchItems = () => {
    if (!fetchEndpoint) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(fetchEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        const raw = data.results || (Array.isArray(data) ? data : []);
        if (raw.length > 0) {
          setItems(raw.map(normalizeRaw));
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (media && media.length > 0) {
      setItems(media);
      setLoading(false);
    } else if (fetchEndpoint) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [media, fetchEndpoint]);

  if (loading) {
    return (
      <section className={cn("py-4 md:py-6 w-full", variant === 'dark' ? "bg-black/20" : "")}>
        <div className="container space-y-4 max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="h-6 w-48 bg-surface rounded animate-pulse" />
              <div className="h-3 w-64 bg-surface rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="min-w-[160px] md:min-w-[190px] aspect-[2/3] bg-surface rounded-xl border border-border-subtle animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0 && error) {
    return (
      <section className={cn("py-4 md:py-6 w-full", variant === 'dark' ? "bg-black/20" : "")}>
        <div className="container space-y-3 max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs text-text-muted mt-1">Unable to load titles right now.</p>
            </div>
            <button
              onClick={fetchItems}
              className="inline-flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-surface border border-border text-white text-xs font-bold rounded-xl transition-colors"
            >
              <RotateCw size={14} className="text-primary" /> Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className={cn(
      "py-4 md:py-6 w-full",
      variant === 'dark' ? "bg-black/20" : ""
    )}>
      <div className="container space-y-4 max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-text-muted font-medium text-xs">
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllHref && (
            <Link 
              href={viewAllHref}
              className="group flex items-center gap-1 text-xs font-semibold text-primary hover:text-white transition-colors"
            >
              See all
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="-mx-4 sm:mx-0">
          <MediaCarousel media={items} />
        </div>
      </div>
    </section>
  );
}
