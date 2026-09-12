'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import type { Review } from '@cinevault/shared-types';
import { ReviewComposerModal } from '@/components/modals/ReviewComposerModal';
import { PenSquare } from 'lucide-react';


interface ReviewsSectionProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  mediaType: 'movie' | 'tv';
}

export function ReviewsSection({ tmdbId, title, posterPath, mediaType }: ReviewsSectionProps) {
  const { isAuthenticated } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', mediaType, tmdbId],
    queryFn: () => api.get<{ data: { items: Review[], total: number, page: number, hasMore: boolean } }>(`/reviews?tmdbId=${tmdbId}&mediaType=${mediaType}&limit=10`).catch(() => ({ data: { items: [] as Review[], total: 0, page: 1, hasMore: false } })),
  });

  const reviewsResponse = data?.data;
  const reviews = Array.isArray(reviewsResponse?.items) ? reviewsResponse.items : [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-[#40bcf4]" size={22} />
          Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-text-muted ml-1">({reviews.length})</span>
          )}
        </h2>
        {isAuthenticated && (
          <button 
            onClick={() => setIsWriteReviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-colors"
          >
            <PenSquare size={16} /> Write Review
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface border border-border-subtle border-dashed flex flex-col items-center gap-3 text-center">
          <MessageSquare size={32} className="text-[#2c3440]" />
          <div>
            <p className="text-sm font-bold text-text-secondary">No reviews yet</p>
            <p className="text-xs text-text-muted mt-1">Be the first to review {title}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
          
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="w-full py-3 rounded-xl border border-border-subtle border-dashed text-sm text-text-secondary hover:text-white hover:border-[#3d4a56] transition-all flex items-center justify-center gap-2"
            >
              {showAll ? 'Show Less' : `See All ${reviews.length} Reviews`}
              <ChevronRight size={16} className={showAll ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>
          )}
        </div>
      )}

      {/* Note: The button above uses WriteReviewModal which was the old modal. Let's switch it to ReviewComposerModal instead */}
      <ReviewComposerModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        mediaType={mediaType}
        tmdbId={tmdbId}
        title={title}
        posterPath={posterPath}
      />
    </section>
  );
}
