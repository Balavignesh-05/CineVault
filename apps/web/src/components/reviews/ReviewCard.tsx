'use client';

import React, { useState } from 'react';
import type { Review } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Image from 'next/image';
import { ThumbsUp, Share2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditReviewModal } from '@/components/modals/EditReviewModal';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
  showFilm?: boolean;
}

export function ReviewCard({ review, showFilm }: ReviewCardProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [spoilerVisible, setSpoilerVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(review.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isAuthor = user?.id === review.userId;

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/reviews/${review.id}`),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['movie-reviews', review.filmId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const toggleLike = useMutation({
    mutationFn: () =>
      isLiked
        ? api.delete(`/reviews/${review.id}/like`)
        : api.post(`/reviews/${review.id}/like`),
    onMutate: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c - 1 : c + 1));
    },
    onError: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c + 1 : c - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-xl glass-panel hover-lift"
    >
      {showFilm && review.film && (
        <Link href={`/movies/${review.film.tmdbId}`} className="shrink-0 hidden sm:block">
          <div className="relative w-16 h-24 rounded-lg overflow-hidden">
            {review.film.posterUrl ? (
              <Image
                src={review.film.posterUrl}
                alt={review.film.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                No Poster
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={review.author?.avatarUrl ?? undefined} />
            <AvatarFallback>{review.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/profile/${review.author?.username}`}
              className="text-sm font-semibold hover:underline text-[var(--color-text-primary)]"
            >
              {review.author?.displayName ?? review.author?.username}
            </Link>
            <div className="text-xs text-[var(--color-text-muted)]">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </div>
          </div>
          
          {isAuthor && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-white">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-elevated border-border-subtle">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="gap-2 cursor-pointer">
                    <Pencil size={14} /> Edit Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-red-500 focus:text-red-500">
                    <Trash2 size={14} /> Delete Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {review.containsSpoilers && !spoilerVisible ? (
          <div className="relative my-2">
            <p className="text-sm text-text-secondary leading-relaxed blur-sm select-none line-clamp-3">{review.body}</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setSpoilerVisible(true)}
                className="px-4 py-2 bg-surface border border-border-subtle rounded-xl text-xs font-bold text-white hover:border-[#ff8000]/50 transition-all"
              >
                ⚠️ Show Spoiler
              </button>
            </div>
          </div>
        ) : (
          <div className="my-2">
            {review.title && (
              <h4 className="font-bold text-[var(--color-text-primary)] mb-1 text-sm">
                {review.title}
              </h4>
            )}
            <p className="text-sm text-text-secondary leading-relaxed line-clamp-4">
              {review.body}
            </p>
            <Link
              href={`/reviews/${review.id}`}
              className="text-xs text-[var(--color-accent-primary)] hover:underline mt-1 inline-block"
            >
              Read full review →
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-subtle">
          <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors">
            <ThumbsUp size={12} /> Helpful
          </button>
          <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors">
            <Share2 size={12} /> Share
          </button>
          <span className="ml-auto text-[10px] text-text-muted">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
      
      {isEditModalOpen && (
        <EditReviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          review={review}
        />
      )}
    </motion.div>
  );
}
