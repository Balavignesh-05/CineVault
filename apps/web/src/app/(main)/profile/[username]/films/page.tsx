'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Film } from 'lucide-react';

export default function ProfileFilmsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data: profileData } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get<any>(`/users/${username}`).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['profile-films', username],
    queryFn: () => api.get<any>(`/users/${username}/films?limit=100`).then(r => r.data),
  });

  const logs = data?.items || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Films</span>
        </div>
        <ProfileNavigation username={username} activeTab="films" counts={{ films: data?.total || logs.length }} />

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Film className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username} hasn&apos;t logged any films yet.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted mt-4">{data?.total || logs.length} films</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {logs.map((log: any) => {
                const film = log.film;
                if (!film) return null;
                const posterUrl = film.posterUrl
                  ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w185${film.posterUrl}`)
                  : null;
                return (
                  <Link key={log.id} href={`/movies/${film.tmdbId || film.id}`} className="group relative aspect-[2/3] bg-surface rounded overflow-hidden block">
                    {posterUrl ? (
                      <img src={posterUrl} alt={film.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-1">{film.title}</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        {log.rating && <span className="text-[10px] text-[#ff8000] font-bold">★{log.rating.toFixed(1)}</span>}
                        {log.liked && <Heart size={10} className="fill-red-500 text-red-500" />}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
