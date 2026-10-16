'use client';

import React, { useState } from 'react';
import { Eye, Heart, Bookmark, Star, BookOpen, ListPlus, Share2, Check, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReviewComposerModal } from '@/components/modals/ReviewComposerModal';
import { AddToCollectionModal } from '@/components/collections/AddToCollectionModal';
import { StarRating } from '@/components/rating/StarRating';

interface MovieActionPanelProps {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseYear?: number | null;
}

export function MovieActionPanel({
  movieId,
  movieTitle,
  posterPath,
  releaseYear,
}: MovieActionPanelProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // 1. Check if liked/logged in diary
  const { data: likedData } = useQuery({
    queryKey: ['film-liked', movieId],
    queryFn: () =>
      api.get<{ liked: boolean; watched?: boolean }>(`/logs/liked/${movieId}`).catch(() => ({
        liked: false,
        watched: false,
      })),
    enabled: isAuthenticated,
  });

  // 2. Check if in watchlist
  const { data: watchlistItem } = useQuery({
    queryKey: ['watchlist', movieId],
    queryFn: () => api.get<any>(`/watchlist/check/${movieId}`).catch(() => null),
    enabled: isAuthenticated,
  });

  // 3. Check user rating
  const { data: ratingData } = useQuery({
    queryKey: ['user-rating', movieId],
    queryFn: () =>
      api
        .get<{ data: { userRating: number | null } }>(`/ratings/film/${movieId}`)
        .then((res) => res.data?.userRating ?? null)
        .catch(() => null),
    enabled: isAuthenticated,
  });

  const isLiked = likedData?.liked || false;
  const isWatched = (likedData as any)?.watched || false;
  const inWatchlist = !!watchlistItem;
  // Convert 1-10 scale from backend to 0.5-5.0 scale for display
  const currentRatingFive = ratingData ? ratingData / 2 : null;

  // ── Mutations ──────────────────────────────────────────

  // Watch / Log toggle
  const toggleWatch = useMutation({
    mutationFn: () =>
      api.post('/logs', {
        tmdbId: movieId,
        watchedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film-liked', movieId] });
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success(isWatched ? 'Logged again' : `Marked ${movieTitle} as watched`, { icon: '👁️' });
    },
    onError: () => toast.error('Failed to update watch status'),
  });

  // Like toggle
  const toggleLike = useMutation({
    mutationFn: () =>
      api.post('/logs', {
        tmdbId: movieId,
        liked: !isLiked,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['film-liked', movieId] });
      const previous = queryClient.getQueryData(['film-liked', movieId]);
      queryClient.setQueryData(['film-liked', movieId], { liked: !isLiked });
      return { previous };
    },
    onError: (_, __, context: any) => {
      queryClient.setQueryData(['film-liked', movieId], context?.previous);
      toast.error('Failed to update like');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['film-liked', movieId] });
    },
    onSuccess: () => {
      toast.success(!isLiked ? 'Added to your likes' : 'Removed from your likes');
    },
  });

  // Watchlist toggle
  const toggleWatchlist = useMutation({
    mutationFn: () =>
      inWatchlist
        ? api.delete(`/watchlist/${movieId}`)
        : api.post('/watchlist', {
            tmdbId: movieId,
            filmTitle: movieTitle,
            posterPath: posterPath || undefined,
            year: releaseYear ? String(releaseYear) : undefined,
            status: 'planned',
          }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['watchlist', movieId] });
      const previous = queryClient.getQueryData(['watchlist', movieId]);
      queryClient.setQueryData(['watchlist', movieId], inWatchlist ? null : { status: 'planned', tmdbId: movieId });
      return { previous };
    },
    onError: (_, __, context: any) => {
      queryClient.setQueryData(['watchlist', movieId], context?.previous);
      toast.error('Failed to update watchlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', movieId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onSuccess: () => {
      toast.success(!inWatchlist ? 'Added to your watchlist' : 'Removed from watchlist');
    },
  });

  // Rate mutation
  const setRatingMutation = useMutation({
    mutationFn: (newRatingFive: number) =>
      api.post(`/ratings/film/${movieId}`, { rating: Math.round(newRatingFive * 2) }),
    onSuccess: (_, newRatingFive) => {
      queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
      toast.success(`Rated ${movieTitle} ${newRatingFive} ★`, { icon: '⭐' });
    },
    onError: () => toast.error('Failed to save rating'),
  });

  const removeRatingMutation = useMutation({
    mutationFn: () => api.delete(`/ratings/film/${movieId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
      toast.success('Rating removed');
    },
    onError: () => toast.error('Failed to remove rating'),
  });

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to track and rate films');
      router.push('/signin');
      return;
    }
    action();
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${movieTitle} on CineVault`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // User cancelled share
    }
  };

  // ── Star calculation ──────────────────────────────────
  const activeRating = hoverRating !== null ? hoverRating : currentRatingFive;

  const RATING_LABELS = [
    '',
    '½ ★ Atrocious',
    '★ Terrible',
    '1½ ★ Bad',
    '★★ Subpar',
    '2½ ★ Average',
    '★★★ Good',
    '3½ ★ Great',
    '★★★★ Excellent',
    '4½ ★ Superb',
    '★★★★★ Masterpiece',
  ];

  return (
    <>
      <div className="bg-[#131A22] border border-[#273442] rounded-2xl p-5 space-y-4 shadow-xl text-[#F4F3EC]">
        {/* Top 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Watch */}
          <button
            onClick={() => requireAuth(() => toggleWatch.mutate())}
            disabled={toggleWatch.isPending}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-bold ${
              isWatched
                ? 'bg-[#1A2430] border-[#35D6A0] text-[#35D6A0] shadow-[0_0_12px_rgba(53,214,160,0.2)]'
                : 'bg-[#1A2430] hover:bg-[#222E3D] border-[#273442] text-[#9AA8B7] hover:text-[#F4F3EC]'
            }`}
            title={isWatched ? 'Watched — click to re-log' : 'Mark as watched'}
            aria-label="Mark movie as watched"
          >
            <Eye size={20} className={isWatched ? 'text-[#35D6A0]' : 'text-current'} />
            <span className="text-[11px] tracking-wide">
              {isWatched ? 'Watched' : 'Watch'}
            </span>
          </button>

          {/* Like */}
          <button
            onClick={() => requireAuth(() => toggleLike.mutate())}
            disabled={toggleLike.isPending}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-bold ${
              isLiked
                ? 'bg-[#1A2430] border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-[#1A2430] hover:bg-[#222E3D] border-[#273442] text-[#9AA8B7] hover:text-[#F4F3EC]'
            }`}
            title={isLiked ? 'Liked — click to unlike' : 'Like movie'}
            aria-label="Like movie"
          >
            <Heart
              size={20}
              className={isLiked ? 'fill-red-400 text-red-400' : 'text-current'}
            />
            <span className="text-[11px] tracking-wide">
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </button>

          {/* Watchlist */}
          <button
            onClick={() => requireAuth(() => toggleWatchlist.mutate())}
            disabled={toggleWatchlist.isPending}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-bold ${
              inWatchlist
                ? 'bg-[#1A2430] border-[#35D6A0] text-[#35D6A0] shadow-[0_0_12px_rgba(53,214,160,0.2)]'
                : 'bg-[#1A2430] hover:bg-[#222E3D] border-[#273442] text-[#9AA8B7] hover:text-[#F4F3EC]'
            }`}
            title={inWatchlist ? 'In your Watchlist — click to remove' : 'Add to Watchlist'}
            aria-label="Toggle watchlist"
          >
            <Bookmark
              size={20}
              className={inWatchlist ? 'fill-[#35D6A0] text-[#35D6A0]' : 'text-current'}
            />
            <span className="text-[11px] tracking-wide">
              {inWatchlist ? 'Watchlist' : 'Watchlist'}
            </span>
          </button>
        </div>

        {/* ── Interactive 5-Star Rating Section ──────────────── */}
        <div className="py-2.5 px-3 bg-[#1A2430]/60 border border-[#273442] rounded-xl text-center space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#9AA8B7] uppercase tracking-wider px-1">
            <span>Rate</span>
            {currentRatingFive !== null && (
              <button
                onClick={() => requireAuth(() => removeRatingMutation.mutate())}
                className="text-[10px] text-red-400 hover:underline lowercase font-normal"
                title="Clear rating"
              >
                clear
              </button>
            )}
          </div>

          {/* Star Bar with half-star precision */}
          <div className="flex items-center justify-center py-1">
            <StarRating
              value={currentRatingFive || 0}
              onChange={(val) =>
                requireAuth(() => {
                  if (val > 0) {
                    setRatingMutation.mutate(val);
                  } else {
                    removeRatingMutation.mutate();
                  }
                })
              }
              size="lg"
              allowHalf={true}
              showLabel={false}
            />
          </div>

          <div className="h-4 text-[11px] font-semibold text-[#35D6A0]">
            {activeRating !== null ? (
              <span>{RATING_LABELS[Math.round(activeRating * 2)]}</span>
            ) : (
              <span className="text-[#9AA8B7]/60 font-normal">Select a star rating</span>
            )}
          </div>
        </div>

        {/* ── Action List (Vertical Stack) ────────────────────── */}
        <div className="space-y-1.5 pt-1 border-t border-[#273442]/50">
          <button
            onClick={() => {
              if (!isAuthenticated) return router.push('/signin');
              router.push('/diary');
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1A2430] hover:bg-[#222E3D] text-[#9AA8B7] hover:text-[#F4F3EC] text-xs font-semibold transition-colors flex items-center justify-between"
          >
            <span>Show your activity</span>
            <span className="text-[#35D6A0] text-[11px] font-bold">
              {isWatched ? '✓ Logged' : ''}
            </span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsReviewModalOpen(true))}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1A2430] hover:bg-[#222E3D] text-[#9AA8B7] hover:text-[#F4F3EC] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <BookOpen size={14} className="text-[#35D6A0]" />
            <span>Review or log...</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsListModalOpen(true))}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1A2430] hover:bg-[#222E3D] text-[#9AA8B7] hover:text-[#F4F3EC] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <ListPlus size={14} className="text-[#40bcf4]" />
            <span>Add to lists...</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#1A2430] hover:bg-[#222E3D] text-[#9AA8B7] hover:text-[#F4F3EC] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Share2 size={14} className="text-[#9AA8B7]" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Review / Diary modal */}
      <ReviewComposerModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        mediaType="movie"
        tmdbId={movieId}
        title={movieTitle}
        posterPath={posterPath}
        releaseYear={releaseYear}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['film-liked', movieId] });
          queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
          queryClient.invalidateQueries({ queryKey: ['film-reviews', movieId] });
        }}
      />

      {/* Add to collection modal */}
      <AddToCollectionModal
        open={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        tmdbId={movieId}
        filmTitle={movieTitle}
      />
    </>
  );
}
