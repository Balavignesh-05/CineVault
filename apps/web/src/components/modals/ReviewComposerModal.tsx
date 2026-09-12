'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Heart } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface ReviewComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear?: number | null;
  onSuccess?: () => void;
}

export function ReviewComposerModal({
  isOpen,
  onClose,
  mediaType,
  tmdbId,
  title,
  posterPath,
  releaseYear,
  onSuccess
}: ReviewComposerModalProps) {
  const router = useRouter();
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [watchedDate, setWatchedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isRewatch, setIsRewatch] = useState(false);
  const [liked, setLiked] = useState(false);
  const [tags, setTags] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setWatchedDate(new Date().toISOString().split('T')[0]);
      setContainsSpoilers(false);
      setLiked(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      if (reviewText.trim().length > 0) {
        // Submit as a Review
        await api.post('/reviews', {
          tmdbId,
          mediaType,
          title,
          body: reviewText.trim(),
          containsSpoilers,
          isPublished: true,
          watchedDate,
          rating: rating > 0 ? rating : undefined,
          isRewatch,
          tags: parsedTags,
        });
      } else {
        // Submit as just a Log
        const endpoint = mediaType === 'movie' ? '/logs' : '/logs/series';
        await api.post(endpoint, {
          tmdbId,
          watchedDate,
          rating: rating > 0 ? rating : undefined,
          liked,
          isRewatch,
          tags: parsedTags,
        });
      }
      
      onSuccess?.();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save your log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1a1d24] border border-[#2c3440] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2c3440] bg-[#15181e]">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">I Watched...</h2>
              <button
                onClick={onClose}
                type="button"
                className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-[#252a33]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {error && (
                <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster */}
                <div className="w-32 shrink-0 hidden sm:block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-[#2c3440] bg-[#252a33] shadow-lg">
                    {posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                        alt={title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs uppercase text-center p-2">
                        No Poster
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">{title}</h3>
                    {releaseYear && <p className="text-sm text-text-muted mt-1">{releaseYear}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Specify Date
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="date"
                          value={watchedDate}
                          onChange={(e) => setWatchedDate(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-[#252a33] border border-[#2c3440] rounded-lg text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Rating
                      </label>
                      <div className="flex items-center h-10 gap-1 bg-[#252a33] px-3 rounded-lg border border-[#2c3440] w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="relative cursor-pointer group w-6 h-6 flex items-center justify-center">
                            {/* Left half */}
                            <div
                              className="absolute left-0 w-1/2 h-full z-10"
                              onMouseEnter={() => setHoverRating(star - 0.5)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star - 0.5)}
                            />
                            {/* Right half */}
                            <div
                              className="absolute right-0 w-1/2 h-full z-10"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star)}
                            />
                            <Star
                              size={20}
                              className={`transition-colors pointer-events-none ${
                                (hoverRating || rating) >= star
                                  ? 'fill-accent-amber text-accent-amber'
                                  : (hoverRating || rating) >= star - 0.5
                                  ? 'fill-accent-amber text-accent-amber' // simplistic half star
                                  : 'text-[#2c3440]'
                              } ${(hoverRating || rating) >= star - 0.5 && (hoverRating || rating) < star ? 'opacity-50' : ''}`}
                            />
                          </div>
                        ))}
                        {rating > 0 && (
                          <span className="ml-2 text-sm font-bold text-accent-amber">
                            {rating.toFixed(1)}
                          </span>
                        )}
                        {rating === 0 && (
                          <span className="ml-2 text-sm text-text-muted">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Review <span className="normal-case font-normal text-text-tertiary">(Optional)</span>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Add a review..."
                      className="w-full h-32 p-4 bg-[#252a33] border border-[#2c3440] rounded-lg text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Spoilers and Rewatch */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setContainsSpoilers(!containsSpoilers)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
                          containsSpoilers ? 'bg-red-500' : 'bg-[#2c3440]'
                        }`}
                      >
                        <span className="sr-only">Contains spoilers</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            containsSpoilers ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-text-muted">Contains spoilers</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsRewatch(!isRewatch)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
                          isRewatch ? 'bg-green-500' : 'bg-[#2c3440]'
                        }`}
                      >
                        <span className="sr-only">I&apos;ve watched this before</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isRewatch ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-text-muted">I&apos;ve watched this before</span>
                    </div>

                    {/* Like / Heart */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLiked(!liked)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        aria-label={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          size={22}
                          className={`transition-colors ${
                            liked
                              ? 'fill-red-500 text-red-500'
                              : 'text-[#2c3440] hover:text-red-400'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-text-muted">Like</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Tags <span className="normal-case font-normal text-text-tertiary">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. cinema, 1990s, mind-bending"
                      className="w-full px-4 py-2 bg-[#252a33] border border-[#2c3440] rounded-lg text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-[#2c3440] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-semibold text-text-muted hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
