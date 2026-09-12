'use client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Bookmark, Trash2, SortAsc } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function WatchlistPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('added');

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist', sortBy],
    queryFn: () => api.get<any>('/watchlist?limit=200').then(res => res.data),
    enabled: isAuthenticated,
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => api.delete(`/watchlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: () => toast.error('Failed to remove'),
  });

  if (isAuthLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Bookmark className="w-12 h-12 text-text-muted mx-auto opacity-50" />
        <p className="text-text-secondary">Please <Link href="/signin" className="text-[#00e054] underline">sign in</Link> to view your watchlist.</p>
      </div>
    </div>
  );

  const rawItems = data?.items || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 max-w-5xl py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Watchlist</h1>
            <p className="text-sm text-text-muted mt-1">{rawItems.length} films</p>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-surface border border-border-subtle text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00e054]"
          >
            <option value="added">When Added</option>
            <option value="title">Title</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : rawItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-surface rounded-xl border border-border-subtle">
            <Bookmark className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold text-white">Your watchlist is empty.</p>
            <p className="text-sm mt-2">Browse films and add them to your watchlist.</p>
            <Link href="/films" className="mt-6">
              <Button className="bg-[#00e054] text-black font-bold hover:bg-[#00e054]/90 rounded-xl">Browse Films</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {rawItems.map((item: any) => {
              const film = item.film;
              if (!film) return null;
              const posterUrl = film.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w185${film.posterUrl}`)
                : null;
              return (
                <div key={item.id} className="group relative aspect-[2/3]">
                  <Link href={`/movies/${film.tmdbId || film.id}`} className="block w-full h-full bg-surface rounded overflow-hidden">
                    {posterUrl ? (
                      <img src={posterUrl} alt={film.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs text-center p-1">{film.title}</div>
                    )}
                  </Link>
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-error"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}