'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProfileLikesPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['profile-likes', username],
    queryFn: () => api.get<any>(`/users/${username}/films?liked=true&limit=100`).then(r => r.data).catch(() => ({ items: [] })),
  });

  const likedLogs = (data?.items || []).filter((log: any) => log.liked);

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Liked Films</span>
        </div>
        <ProfileNavigation username={username} activeTab="likes" counts={{ likes: likedLogs.length }} />

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : likedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Heart className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username} hasn&apos;t liked any films yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-6">
            {likedLogs.map((log: any) => {
              const film = log.film;
              if (!film) return null;
              const posterUrl = film.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w185${film.posterUrl}`)
                : null;
              return (
                <Link key={log.id} href={`/movies/${film.tmdbId || film.id}`} className="group aspect-[2/3] block bg-surface rounded overflow-hidden">
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
