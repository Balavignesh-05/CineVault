'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

import type { Review } from '@cinevault/shared-types';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
}

export function EditReviewModal({
  isOpen,
  onClose,
  review,
}: EditReviewModalProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(review.title || '');
  const [body, setBody] = useState(review.body || '');
  const [containsSpoilers, setContainsSpoilers] = useState(review.containsSpoilers || false);
  const [isPublished, setIsPublished] = useState(review.isPublished ?? true);

  const reviewMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/reviews/${review.id}`, data),
    onSuccess: () => {
      toast.success(`Review updated!`, {
        description: 'Your review has been successfully updated.',
        icon: '📝',
      });
      queryClient.invalidateQueries({ queryKey: ['review', review.id] });
      queryClient.invalidateQueries({ queryKey: ['movie-reviews', review.filmId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTitle('');
      setBody('');
      setContainsSpoilers(false);
      setIsPublished(true);
      onClose();
    },
    onError: () => {
      toast.error('Failed to post review', { description: 'Please try again.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to write reviews');
      return;
    }
    if (!body.trim()) {
      toast.error('Review body cannot be empty');
      return;
    }

    reviewMutation.mutate({
      title: title.trim() || undefined,
      body: body.trim(),
      containsSpoilers,
      isPublished,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-5 border-b border-border-subtle shrink-0">
                {review.film?.posterUrl ? (
                  <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                    <Image src={review.film.posterUrl.startsWith('http') ? review.film.posterUrl : `https://image.tmdb.org/t/p/w92${review.film.posterUrl}`} alt={review.film?.title || 'Movie'} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-14 bg-elevated rounded flex items-center justify-center shrink-0">
                    <Film size={16} className="text-text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white line-clamp-1">Edit Review for {review.film?.title}</h2>
                  <p className="text-xs text-text-muted font-mono">Update your thoughts</p>
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-elevated">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="review-title" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Review Title (Optional)</label>
                    <input
                      id="review-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your review a catchy title"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border-subtle text-white text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2 flex flex-col h-full min-h-[200px]">
                    <label htmlFor="review-body" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Review *</label>
                    <textarea
                      id="review-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your thoughts..."
                      required
                      className="w-full flex-1 min-h-[200px] px-3 py-3 rounded-xl bg-background border border-border-subtle text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${containsSpoilers ? 'bg-primary border-primary text-black' : 'border-border-subtle group-hover:border-primary'}`}>
                        {containsSpoilers && <CheckSquare size={14} />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={containsSpoilers}
                        onChange={(e) => setContainsSpoilers(e.target.checked)}
                      />
                      <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Contains spoilers</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isPublished ? 'bg-primary border-primary text-black' : 'border-border-subtle group-hover:border-primary'}`}>
                        {isPublished && <CheckSquare size={14} />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                      />
                      <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Publish to public</span>
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-border-subtle bg-background/50 flex gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border-subtle bg-transparent text-text-secondary hover:bg-elevated hover:text-white">Cancel</Button>
                <Button type="submit" form="review-form" disabled={reviewMutation.isPending} className="flex-1 bg-primary hover:bg-[#00c048] text-[#14181c] font-bold">
                  {reviewMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
