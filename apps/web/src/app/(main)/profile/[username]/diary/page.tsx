'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { BookOpen, Star, RotateCcw, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProfileDiaryPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['profile-diary', username],
    queryFn: () => api.get<any>(`/users/${username}/films?limit=100`).then(r => r.data),
  });

  const logs = (data?.items || []).sort((a: any, b: any) => {
    const dateA = new Date(a.watchedDate || a.createdAt).getTime();
    const dateB = new Date(b.watchedDate || b.createdAt).getTime();
    return dateB - dateA;
  });

  // Group by month+year
  const grouped: Record<string, any[]> = {};
  logs.forEach((log: any) => {
    const date = new Date(log.watchedDate || log.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Diary</span>
        </div>
        <ProfileNavigation username={username} activeTab="diary" counts={{ diary: logs.length }} />

        {isLoading ? (
          <div className="space-y-8 mt-6">
            {[1,2].map(i => <div key={i} className="space-y-3"><div className="h-6 w-32 bg-surface rounded animate-pulse" /><div className="h-20 bg-surface rounded animate-pulse" /></div>)}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <BookOpen className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username}&apos;s diary is empty.</p>
          </div>
        ) : (
          <div className="space-y-10 mt-6">
            {Object.entries(grouped).map(([monthKey, entries]) => {
              const [year, month] = monthKey.split('-');
              const monthName = monthNames[parseInt(month) - 1];
              return (
                <section key={monthKey}>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-4 border-b border-border-subtle pb-2">
                    {monthName} {year}
                  </h2>
                  <div className="space-y-px">
                    {entries.map((log: any) => {
                      const film = log.film;
                      if (!film) return null;
                      const date = new Date(log.watchedDate || log.createdAt);
                      const posterUrl = film.posterUrl
                        ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                        : null;
                      return (
                        <div key={log.id} className="flex items-center gap-4 py-2 border-b border-border-subtle/30 hover:bg-surface/50 rounded px-2 group">
                          <span className="text-lg font-black text-text-muted w-7 text-right shrink-0">{date.getDate()}</span>
                          <Link href={`/movies/${film.tmdbId || film.id}`}>
                            <div className="w-8 h-12 bg-elevated rounded overflow-hidden shrink-0">
                              {posterUrl && <img src={posterUrl} alt={film.title} className="w-full h-full object-cover" />}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/movies/${film.tmdbId || film.id}`} className="text-sm font-bold text-white hover:text-[#00e054] transition-colors truncate block">
                              {film.title}
                            </Link>
                            {film.releaseDate && (
                              <span className="text-xs text-text-muted">{new Date(film.releaseDate).getFullYear()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {log.isRewatch && <span title="Rewatch"><RotateCcw size={12} className="text-[#40bcf4]" /></span>}
                            {log.liked && <Heart size={12} className="fill-red-400 text-red-400" />}
                            {log.rating && (
                              <span className="text-xs text-[#ff8000] font-bold flex items-center gap-0.5">
                                <Star size={10} className="fill-[#ff8000]" />{log.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
