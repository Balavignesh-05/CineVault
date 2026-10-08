'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MediaCard } from '@/components/media/MediaCard';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function RecommendationsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get<{ data: any }>('/recommendations').then(res => res.data).catch(() => fetch('/api/tmdb/popular').then(res => res.json())),
  });

  const items = data?.results || (Array.isArray(data) ? data : []);

  return (
    <div className="min-h-screen bg-background text-text-secondary py-6 md:py-8 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">AI Recommendations</h1>
              <p className="text-xs text-text-muted mt-0.5">Films customized to your unique taste and watch habits</p>
            </div>
          </div>
          <Button 
            onClick={() => refetch()} 
            disabled={isFetching}
            variant="outline"
            className="rounded-full px-5 text-xs font-bold border-white/20 hover:border-primary hover:text-primary transition-all self-start sm:self-auto gap-2"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Refreshing..." : "Refresh Suggestions"}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-surface/50 border border-white/[0.06]">
            <div className="w-14 h-14 rounded-full bg-surface border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
              <Sparkles size={26} className="opacity-80" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">No recommendations found</h3>
            <p className="text-xs text-text-muted max-w-sm mb-6 leading-relaxed">
              Log or rate a few more films to help us personalize recommendations for you, or refresh to pull trending titles.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="rounded-full px-5 text-xs font-bold border-white/20 hover:border-primary hover:text-primary transition-all"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5">
            {items.map((movie: any) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
