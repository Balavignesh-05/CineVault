import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Star, Film, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileReviewsProps {
  username: string;
}

export function ProfileReviews({ username }: ProfileReviewsProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', username, 'reviews', 'recent'],
    queryFn: () => api.get<any>(`/users/${username}/reviews?limit=3`).then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Recent Reviews</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 p-4">
              <div className="w-16 h-24 bg-elevated rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-elevated rounded w-1/3"></div>
                <div className="h-16 bg-elevated rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.items || data.items.length === 0) {
    return null; // Hide if no reviews
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Recent Reviews</h2>
        <Link href={`/profile/${username}/reviews`} className="text-xs font-bold text-primary hover:text-white transition-colors">
          More
        </Link>
      </div>

      <div className="space-y-6">
        {data.items.map((review: any) => (
          <div key={review.id} className="group flex gap-4">
            <Link href={`/movies/${review.film.id}`} className="shrink-0 relative w-16 h-24 bg-elevated rounded overflow-hidden shadow-md block border border-transparent group-hover:border-border-subtle transition-colors">
              {review.film.posterUrl ? (
                <Image src={`https://image.tmdb.org/t/p/w92${review.film.posterUrl}`} alt={review.film.title} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted"><Film size={20} /></div>
              )}
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <Link href={`/movies/${review.film.id}`} className="font-bold text-white hover:text-primary transition-colors text-lg">
                  {review.film.title}
                </Link>
                {review.film.releaseDate && <span className="text-sm text-text-muted">{new Date(review.film.releaseDate).getFullYear()}</span>}
              </div>
              
              <div className="flex items-center gap-3 text-sm mb-2">
                {review.rating && (
                  <div className="flex items-center text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating / 2 ? "fill-current" : "opacity-30"} />
                    ))}
                  </div>
                )}
                <span className="text-text-muted text-xs">
                  Watched {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <Link href={`/reviews/${review.id}`} className="block">
                <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed hover:text-white transition-colors">
                  {review.content}
                </p>
                {review.containsSpoilers && (
                  <span className="inline-block mt-2 text-xs font-bold px-2 py-1 bg-red-500/10 text-red-500 rounded">
                    Contains Spoilers
                  </span>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
