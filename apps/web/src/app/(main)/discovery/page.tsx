import React, { Suspense } from 'react';
import Link from 'next/link';
import { Search, Compass, SlidersHorizontal, Star } from 'lucide-react';
import { getTrending, getPopular, discoverMovies, normalizeMovieCard } from '@/lib/tmdb/client';
import { MediaCard } from '@/components/media/MediaCard';

export const dynamic = 'force-dynamic';

const GENRES = [
  { name: 'All', slug: '' },
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
  const [trendingData, popularData, recommendedData] = await Promise.all([
    getTrending('week').catch(() => ({ results: [] })),
    getPopular(1).catch(() => ({ results: [] })),
    discoverMovies({ sort_by: 'popularity.desc', with_genres: '28,12,878' }).catch(() => ({ results: [] })),
  ]);

  const trendingMovies = trendingData.results?.slice(0, 14).map(normalizeMovieCard) || [];
  const popularMovies = popularData.results?.slice(0, 21).map(normalizeMovieCard) || [];
  const recommendedMovies = recommendedData.results?.slice(0, 14).map(normalizeMovieCard) || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-16">
      <div className="container mx-auto px-4 py-6 max-w-[1600px] space-y-8">
        
        {/* Header & Quick Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Cinema Catalog</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-primary" /> Discover Cinema
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-1">
              Filter films by genre, decade, streaming platform, or country
            </p>
          </div>

          <form action="/search" method="GET" className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              name="q"
              placeholder="Search by title, director, actor..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-white/10 rounded-full text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </form>
        </div>

        {/* Compact Filter Rails */}
        <div className="space-y-3 bg-[#11151c] p-4 sm:p-5 rounded-2xl border border-white/[0.06]">
          {/* Genres */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-black text-text-muted uppercase tracking-wider shrink-0 w-16">Genre</span>
            <div className="flex items-center gap-2">
              {GENRES.map((g) => (
                <Link
                  key={g.slug || 'all'}
                  href={g.slug ? `/discovery/genre/${g.slug}` : '/discovery'}
                  className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-primary hover:text-black border border-white/10 text-xs font-semibold text-text-secondary hover:border-primary transition-all whitespace-nowrap"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Decades */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none border-t border-white/[0.04] pt-2.5">
            <span className="text-[11px] font-black text-text-muted uppercase tracking-wider shrink-0 w-16">Decade</span>
            <div className="flex items-center gap-2">
              {DECADES.map((d) => (
                <Link
                  key={d.year}
                  href={`/discovery/decade/${d.year}`}
                  className="px-3.5 py-1.5 rounded-full bg-surface/80 hover:bg-primary hover:text-black border border-white/10 text-xs font-semibold text-text-secondary hover:border-primary transition-all whitespace-nowrap"
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Streaming & Country Chips */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none border-t border-white/[0.04] pt-2.5">
            <span className="text-[11px] font-black text-text-muted uppercase tracking-wider shrink-0 w-16">Platform</span>
            <div className="flex items-center gap-2">
              {PROVIDERS.map((p) => (
                <Link
                  key={p.id}
                  href={`/discovery/streaming/${p.id}`}
                  className="px-3 py-1.5 rounded-lg bg-surface/80 hover:bg-surface border border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                >
                  {p.name}
                </Link>
              ))}
              <span className="text-white/20 mx-1">•</span>
              {COUNTRIES.map((c) => (
                <Link
                  key={c.code}
                  href={`/discovery/country/${c.code}`}
                  className="px-3 py-1.5 rounded-lg bg-surface/80 hover:bg-surface border border-white/10 text-xs font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Section */}
        {trendingMovies.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Trending Now</h2>
                <p className="text-xs text-text-muted">Top films drawing audience discussions this week</p>
              </div>
              <Link href="/films" className="text-xs font-semibold text-primary hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
              {trendingMovies.slice(0, 7).map((m: any) => (
                <MediaCard key={m.id} media={m} />
              ))}
            </div>
          </div>
        )}

        {/* Discovery Results Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Popular Discoveries</h2>
              <p className="text-xs text-text-muted">Explore high-rated and culturally acclaimed titles</p>
            </div>
            <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">{popularMovies.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
            {popularMovies.map((m: any) => (
              <MediaCard key={m.id} media={m} />
            ))}
          </div>
        </div>

        {/* Recommended for You */}
        {recommendedMovies.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Recommended for You</h2>
                <p className="text-xs text-text-muted">Selected titles across action, sci-fi and drama</p>
              </div>
              <Link href="/recommendations" className="text-xs font-semibold text-primary hover:underline">
                More recommendations →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
              {recommendedMovies.slice(0, 7).map((m: any) => (
                <MediaCard key={m.id} media={m} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
