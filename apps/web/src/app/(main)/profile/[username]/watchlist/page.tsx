'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function ProfileWatchlistPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  // We fetch the public watchlist via a special endpoint or use films endpoint
  // For now we use the same data pattern as films but for watchlist
  const { data, isLoading } = useQuery({
    queryKey: ['profile-watchlist', username],
    queryFn: () => api.get<any>(`/watchlist?username=${username}&limit=100`).then(r => r.data).catch(() => ({ items: [] })),
  });

  const items = data?.items || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Watchlist</span>
        </div>
        <ProfileNavigation username={username} activeTab="watchlist" counts={{ watchlist: items.length }} />

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Bookmark className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username}&apos;s watchlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-6">
            {items.map((item: any) => {
              const film = item.film;
              if (!film) return null;
              const posterUrl = film.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w185${film.posterUrl}`)
                : null;
              return (
                <Link key={item.id} href={`/movies/${film.tmdbId || film.id}`} className="group aspect-[2/3] block bg-surface rounded overflow-hidden">
                  {posterUrl ? (
                    <img src={posterUrl} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-1">{film.title}</div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
