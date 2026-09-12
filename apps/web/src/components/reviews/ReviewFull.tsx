'use client';

import React, { useState } from 'react';
import type { Review } from '@cinevault/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { CommentList } from '@/components/comments/CommentList';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditReviewModal } from '@/components/modals/EditReviewModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ReviewFullProps {
  review: Review;
}

function renderMarkdown(text: string): string {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');
  html = html.replace(/\n/g, '<br />');
  return html;
}

export function ReviewFull({ review }: ReviewFullProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const [showSpoiler, setShowSpoiler] = useState(false);
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
      router.push(`/movies/${review.film?.tmdbId}`);
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
        ? api.delete<void>(`/reviews/${review.id}/like`)
        : api.post<void>(`/reviews/${review.id}/like`),
    onMutate: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c - 1 : c + 1));
    },
    onError: () => {
      setIsLiked((p) => !p);
      setLikeCount((c) => (isLiked ? c + 1 : c - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['review', review.id] });
    },
  });

  return (
    <article className="max-w-3xl mx-auto py-8">
      {/* Author header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-border-subtle)]">
        <Avatar className="w-16 h-16">
          <AvatarImage src={review.author?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xl">
            {review.author?.displayName?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Review by{' '}
            <Link
              href={`/profile/${review.author?.username}`}
              className="hover:underline text-[var(--color-accent-primary)]"
            >
              {review.author?.displayName ?? review.author?.username}
            </Link>
          </h2>
          <div className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-3">
            <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
            {review.readingTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {review.readingTimeMinutes} min read
              </span>
            )}
          </div>
        </div>

        {isAuthor && (
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-text-muted hover:text-white">
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-elevated border-border-subtle">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="gap-2 cursor-pointer py-3">
                  <Pencil size={16} /> Edit Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer py-3 text-red-500 focus:text-red-500">
                  <Trash2 size={16} /> Delete Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] mb-6">{review.title}</h1>
      )}

      {/* Body */}
      {review.containsSpoilers && !showSpoiler ? (
        <button
          className="my-8 p-12 w-full bg-[var(--color-bg-surface)] border-2 border-dashed border-[var(--color-border-default)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg-elevated)] transition-colors"
          onClick={() => setShowSpoiler(true)}
        >
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Warning: Spoilers</h3>
          <p className="text-[var(--color-text-muted)]">This review contains spoilers. Click to reveal.</p>
        </button>
      ) : (
        <div
          className="prose prose-invert prose-lg max-w-none text-[var(--color-text-primary)] leading-relaxed mb-12"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(review.body) }}
        />
      )}

      {/* Like action */}
      <div className="flex items-center gap-4 py-6 border-t border-[var(--color-border-subtle)] mb-12">
        <Button
          variant={isLiked ? 'default' : 'outline'}
          size="lg"
          className="gap-2"
          onClick={() => toggleLike.mutate()}
          disabled={toggleLike.isPending}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </Button>
      </div>

      {/* Comments */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          Comments ({review.commentCount})
        </h3>
        <CommentList reviewId={review.id} commentCount={review.commentCount} />
      </div>

      {isEditModalOpen && (
        <EditReviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          review={review}
        />
      )}
    </article>
  );
}
