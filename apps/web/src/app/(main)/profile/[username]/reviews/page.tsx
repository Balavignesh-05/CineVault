'use client';
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProfileNavigation } from '@/components/profile/ProfileNavigation';
import { Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProfileReviewsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['profile-reviews', username],
    queryFn: () => api.get<any>(`/users/${username}/reviews?limit=50`).then(r => r.data),
  });

  const reviews = data?.items || [];

  return (
    <div className="min-h-screen bg-background text-text-secondary pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-white">{username}</span>
          <span className="text-text-muted">&apos;s Reviews</span>
        </div>
        <ProfileNavigation username={username} activeTab="reviews" counts={{ reviews: data?.total || reviews.length }} />

        {isLoading ? (
          <div className="space-y-4 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-surface rounded animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-semibold">{username} hasn&apos;t written any reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {reviews.map((review: any) => {
              const film = review.film;
              const posterUrl = film?.posterUrl
                ? (film.posterUrl.startsWith('http') ? film.posterUrl : `https://image.tmdb.org/t/p/w92${film.posterUrl}`)
                : null;
              return (
                <article key={review.id} className="flex gap-4 p-5 bg-surface border border-border-subtle rounded-xl hover:border-border-default transition-colors">
                  {posterUrl && (
                    <Link href={`/movies/${film?.tmdbId || film?.id}`} className="shrink-0">
                      <img src={posterUrl} alt={film?.title} className="w-14 h-20 object-cover rounded" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link href={`/movies/${film?.tmdbId || film?.id}`} className="text-white font-bold hover:text-[#00e054] transition-colors">
                        {film?.title || 'Unknown Film'}
                        {film?.releaseDate && <span className="ml-2 text-xs text-text-muted font-normal">{new Date(film.releaseDate).getFullYear()}</span>}
                      </Link>
                      {review.rating && (
                        <span className="text-[#ff8000] font-bold text-sm flex items-center gap-1 shrink-0">
                          <Star size={12} className="fill-[#ff8000]" />{review.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-4">
                      {review.containsSpoilers ? (
                        <span className="text-text-muted italic">This review contains spoilers.</span>
                      ) : review.body}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
