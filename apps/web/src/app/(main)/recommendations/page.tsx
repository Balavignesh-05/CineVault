'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MediaCard } from '@/components/media/MediaCard';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function RecommendationsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get<{ data: any }>('/recommendations').then(res => res.data).catch(() => fetch('/api/tmdb/popular').then(res => res.json())),
  });

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent-amber" />
            <h1 className="text-3xl font-bold text-white">For You</h1>
          </div>
          <Button onClick={() => refetch()} disabled={isFetching}>Refresh</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : !data || (data.results && data.results.length === 0) || (Array.isArray(data) && data.length === 0) ? (
          <div className="text-center py-20 text-text-muted">No recommendations found at the moment.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(data.results || data).map((movie: any) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
