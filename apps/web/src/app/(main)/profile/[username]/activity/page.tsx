'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { Activity, Eye, BookOpen, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function ProfileActivityPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['profile-activity', username],
    queryFn: () => api.get<any>(`/users/${username}/activity?limit=50`).then(r => r.data).catch(() => ({ items: [] })),
  });

  const items = data?.items || data || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Activity</span>
        </div>
        <ProfileNavigation username={username} activeTab="activity" />

        {isLoading ? (
          <div className="space-y-4 mt-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-3 p-3 bg-surface rounded-xl animate-pulse">
                <div className="w-8 h-8 rounded-full bg-elevated shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-elevated rounded w-3/4" />
                  <div className="h-3 bg-elevated rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Activity className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">No activity yet.</p>
          </div>
        ) : (
          <div className="space-y-1 mt-6">
            {items.map((item: any, i: number) => {
              const film = item.film || item.series || {};
              const posterUrl = film.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                : null;
              const timeAgo = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';
              const label = {
                logged: 'watched',
                reviewed: 'reviewed',
                liked: 'liked',
                rewatched: 'rewatched',
                watchlisted: 'added to watchlist',
              }[item.actionType as string] || item.actionType;

              return (
                <div key={item.id || i} className="flex items-center gap-3 py-3 px-2 border-b border-border-subtle/20 hover:bg-surface/40 rounded group">
                  <div className="text-text-muted shrink-0">
                    {item.actionType === 'reviewed' && <BookOpen size={14} />}
                    {item.actionType === 'liked' && <Heart size={14} className="text-red-400" />}
                    {(item.actionType === 'logged' || item.actionType === 'rewatched') && <Eye size={14} className="text-[#00e054]" />}
                    {item.actionType === 'watchlisted' && <Star size={14} className="text-[#40bcf4]" />}
                    {!['reviewed','liked','logged','rewatched','watchlisted'].includes(item.actionType) && <Activity size={14} />}
                  </div>
                  {posterUrl && (
                    <Link href={film.tmdbId ? `/movies/${film.tmdbId}` : '#'}>
                      <img src={posterUrl} alt={film.title} className="w-7 h-10 object-cover rounded shrink-0" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="text-text-muted">{label} </span>
                      {film.title && (
                        <Link href={film.tmdbId ? `/movies/${film.tmdbId}` : '#'} className="font-bold text-white hover:text-[#00e054] transition-colors">
                          {film.title}
                        </Link>
                      )}
                    </p>
                    {item.rating && (
                      <span className="text-[10px] text-[#ff8000]">
                        {'★'.repeat(Math.floor(item.rating))}{item.rating % 1 ? '½' : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">{timeAgo}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
