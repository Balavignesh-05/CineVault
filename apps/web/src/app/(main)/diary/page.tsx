'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { BookOpen, Star, RotateCcw, Heart, Trash2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function DiaryPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [filterYear, setFilterYear] = useState<string>('all');

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['diary'],
    queryFn: () => api.get<{ data: { items: any[] } }>('/logs/me?limit=200').then(res => res.data),
    enabled: isAuthenticated,
  });

  const deleteLog = useMutation({
    mutationFn: (id: string) => api.delete(`/logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success('Entry removed');
    },
    onError: () => toast.error('Failed to remove entry'),
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <BookOpen className="w-12 h-12 text-text-muted mx-auto opacity-50" />
        <p className="text-text-secondary">Please <Link href="/signin" className="text-[#00e054] underline">sign in</Link> to view your diary.</p>
      </div>
    </div>
  );

  const allItems = (logsData?.items || []).sort((a: any, b: any) => {
    return new Date(b.watchedDate || b.createdAt).getTime() - new Date(a.watchedDate || a.createdAt).getTime();
  });

  const years = Array.from(new Set(allItems.map((log: any) => new Date(log.watchedDate || log.createdAt).getFullYear())));
  const items = filterYear === 'all' ? allItems : allItems.filter((log: any) => new Date(log.watchedDate || log.createdAt).getFullYear() === parseInt(filterYear));

  // Group by YYYY-MM
  const grouped: Record<string, any[]> = {};
  items.forEach((log: any) => {
    const date = new Date(log.watchedDate || log.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 max-w-4xl py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Diary</h1>
          <div className="flex items-center gap-3">
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="bg-surface border border-border-subtle text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00e054]"
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[1,2].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-36" />
                {[1,2,3].map(j => <Skeleton key={j} className="h-16 w-full rounded" />)}
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted border border-border-subtle rounded-xl bg-surface">
            <BookOpen className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold text-white">No diary entries yet.</p>
            <p className="text-sm mt-2">Start logging films to build your diary.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([monthKey, entries]) => {
              const [year, month] = monthKey.split('-');
              return (
                <section key={monthKey}>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.15em] mb-0 border-b border-border-subtle pb-2 flex items-center gap-3">
                    <span>{MONTH_NAMES[parseInt(month) - 1]} {year}</span>
                    <span className="text-text-muted font-normal normal-case tracking-normal">({entries.length})</span>
                  </h2>
                  <div>
                    {entries.map((log: any) => {
                      const isTV = log.type === 'series';
                      const film = log.film || log.series;
                      if (!film) return null;
                      const link = isTV ? `/series/${film.tmdbId || film.id}` : `/movies/${film.tmdbId || film.id}`;
                      const posterUrl = film.posterUrl
                        ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                        : null;
                      const date = new Date(log.watchedDate || log.createdAt);
                      return (
                        <div key={log.id} className="flex items-center gap-3 py-2.5 px-2 border-b border-border-subtle/20 hover:bg-surface/60 rounded group">
                          {/* Day number */}
                          <span className="text-2xl font-black text-text-muted w-8 text-right shrink-0 tabular-nums">{date.getDate()}</span>
                          {/* Day of week */}
                          <span className="text-[10px] text-text-muted uppercase w-6 shrink-0">{['SUN','MON','TUE','WED','THU','FRI','SAT'][date.getDay()]}</span>
                          {/* Poster */}
                          <Link href={link}>
                            <div className="w-8 h-12 bg-elevated rounded overflow-hidden shrink-0 hover:ring-1 hover:ring-[#00e054] transition-all">
                              {posterUrl && <img src={posterUrl} alt={film.title} className="w-full h-full object-cover" />}
                            </div>
                          </Link>
                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            <Link href={link} className="text-sm font-bold text-white hover:text-[#00e054] transition-colors block truncate">
                              {film.title}
                            </Link>
                            {film.releaseDate && (
                              <span className="text-[10px] text-text-muted">{new Date(film.releaseDate).getFullYear()}</span>
                            )}
                          </div>
                          {/* Indicators */}
                          <div className="flex items-center gap-2 shrink-0">
                            {log.isRewatch && <span title="Rewatch"><RotateCcw size={11} className="text-[#40bcf4]" /></span>}
                            {log.liked && <Heart size={11} className="fill-red-400 text-red-400" />}
                            {log.rating && (
                              <span className="text-xs text-[#ff8000] font-bold flex items-center gap-0.5 tabular-nums">
                                {'\u2605'.repeat(Math.floor(log.rating))}{log.rating % 1 ? '\u00bd' : ''}
                              </span>
                            )}
                            <button
                              onClick={() => { if (confirm('Remove this entry?')) deleteLog.mutate(log.id); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error p-1"
                              title="Remove entry"
                            >
                              <Trash2 size={12} />
                            </button>
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