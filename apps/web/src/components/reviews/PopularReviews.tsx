'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

export function PopularReviews() {
  const { data, isLoading } = useQuery({
    queryKey: ['popular-reviews'],
    queryFn: () => api.get<{ data: any[] }>('/reviews/popular').catch(() => ({ data: [] })),
    staleTime: 5 * 60 * 1000,
  });

  const reviews = data?.data || [];

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  if (reviews.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-white">Popular Reviews</h2>
      <div className="space-y-3">
        {reviews.map((review: any) => (
          <div key={review.id} className="p-4 bg-surface border border-border-subtle rounded-2xl hover:border-primary/30 transition-all space-y-3">
            <div className="flex items-start gap-3">
              {review.movie?.posterUrl && (
                <Link href={`/movies/${review.movie.tmdbId}`}>
                  <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                    <Image src={review.movie.posterUrl} alt={review.movie.title} fill sizes="40px" className="object-cover" />
                  </div>
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{review.user?.username || 'User'}</span>
                  {review.rating && (
                    <span className="flex items-center gap-1 text-xs text-accent-amber font-bold">
                      <Star size={10} className="fill-[#ff8000]" /> {(review.rating / 2).toFixed(1)}
                    </span>
                  )}
                </div>
                {review.movie && (
                  <Link href={`/movies/${review.movie.tmdbId}`} className="text-xs text-primary hover:underline">
                    {review.movie.title}
                  </Link>
                )}
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{review.content}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
                <ThumbsUp size={11} /> {review.likes || 0} helpful
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
