import React, { Suspense } from 'react';
import Link from 'next/link';
import { Search, Compass, SlidersHorizontal, Star } from 'lucide-react';
import { getTrending, getPopular, normalizeMovieCard } from '@/lib/tmdb/client';
import { MediaCard } from '@/components/media/MediaCard';

export const revalidate = 3600;

const GENRES = [
  { name: 'Action', slug: 'action' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Sci-Fi', slug: 'science-fiction' },
  { name: 'Horror', slug: 'horror' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Animation', slug: 'animation' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Documentary', slug: 'documentary' },
];

const DECADES = [
  { year: 2020, label: '2020s' },
  { year: 2010, label: '2010s' },
  { year: 2000, label: '2000s' },
  { year: 1990, label: '1990s' },
  { year: 1980, label: '1980s' },
  { year: 1970, label: '1970s' },
];

const PROVIDERS = [
  { id: 8, name: 'Netflix' },
  { id: 119, name: 'Prime Video' },
  { id: 337, name: 'Disney+' },
  { id: 384, name: 'Max' },
  { id: 350, name: 'Apple TV+' },
  { id: 15, name: 'Hulu' },
  { id: 11, name: 'MUBI' },
  { id: 283, name: 'Crunchyroll' },
  { id: 531, name: 'Paramount+' },
  { id: 192, name: 'YouTube' },
  { id: 3, name: 'Google Play' },
];

const COUNTRIES = [
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'UK' },
  { code: 'KR', name: 'Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
];

export default async function DiscoveryPage() {
  const [trendingData, popularData] = await Promise.all([
    getTrending('week').catch(() => ({ results: [] })),
    getPopular(1).catch(() => ({ results: [] })),
  ]);

  const trendingMovies = trendingData.results?.slice(0, 12).map(normalizeMovieCard) || [];
  const popularMovies = popularData.results?.slice(0, 18).map(normalizeMovieCard) || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-16">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
        
        {/* Header & Quick Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" /> Discover
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-1">
              Filter films by genre, decade, streaming provider, or country
            </p>
          </div>

          <form action="/search" method="GET" className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              name="q"
              placeholder="Search by title, actor, director..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border-subtle rounded-full text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </form>
        </div>

        {/* Filter Navigation Chips */}
        <div className="space-y-4">
          {/* Genres */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Genres</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {GENRES.map((g) => (
                <Link
                  key={g.slug}
                  href={`/discovery/genre/${g.slug}`}
                  className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-primary/20 hover:border-primary/40 border border-border-subtle text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Decades */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Decades</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {DECADES.map((d) => (
                <Link
                  key={d.year}
                  href={`/discovery/decade/${d.year}`}
                  className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-primary/20 hover:border-primary/40 border border-border-subtle text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Streaming & Country Chips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Streaming Services</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {PROVIDERS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/discovery/streaming/${p.id}`}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Countries</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {COUNTRIES.map((c) => (
                  <Link
                    key={c.code}
                    href={`/discovery/country/${c.code}`}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trending Section */}
        {trendingMovies.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Trending Now</h2>
              <Link href="/films" className="text-xs font-semibold text-primary hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {trendingMovies.slice(0, 6).map((m: any) => (
                <MediaCard key={m.id} media={m} />
              ))}
            </div>
          </div>
        )}

        {/* Discovery Results Grid */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Popular Discoveries</h2>
            <span className="text-xs text-text-muted">{popularMovies.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {popularMovies.map((m: any) => (
              <MediaCard key={m.id} media={m} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
