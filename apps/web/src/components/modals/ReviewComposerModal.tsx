'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Heart } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/rating/StarRating';

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
  onSuccess,
}: ReviewComposerModalProps) {
  const router = useRouter();

  const [rating, setRating] = useState<number>(0);
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
      const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

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
            className="absolute inset-0 bg-[#0B0F14]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-2xl bg-[#131A22] border border-[#273442] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#273442] bg-[#0B0F14]">
              <h2 className="text-sm font-black text-[#F4F3EC] uppercase tracking-wider">
                Log / Review Film
              </h2>
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 text-[#9AA8B7] hover:text-[#F4F3EC] transition-colors rounded-lg hover:bg-[#1A2430]"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster */}
                <div className="w-28 shrink-0 hidden sm:block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-[#273442] bg-[#1A2430] shadow-md">
                    {posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                        alt={title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9AA8B7] text-xs uppercase text-center p-2 font-medium">
                        No Poster
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F4F3EC] leading-tight">
                      {title}
                    </h3>
                    {releaseYear && (
                      <p className="text-xs text-[#9AA8B7] mt-1 font-semibold">{releaseYear}</p>
                    )}
                  </div>

                  {/* Date and Rating Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
                        Specify Date
                      </label>
                      <div className="relative">
                        <Calendar
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA8B7] pointer-events-none"
                        />
                        <input
                          type="date"
                          value={watchedDate}
                          onChange={(e) => setWatchedDate(e.target.value)}
                          className="w-full h-11 pl-9 pr-3 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
                        Rating
                      </label>
                      <div className="flex items-center h-11 px-3 bg-[#0B0F14] rounded-xl border border-[#273442] overflow-x-auto">
                        <StarRating
                          value={rating}
                          onChange={(newRating) => setRating(newRating)}
                          size="md"
                          allowHalf={true}
                          showLabel={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
                      Review <span className="normal-case font-normal text-[#9AA8B7]/70">(Optional)</span>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Add a review..."
                      rows={4}
                      className="w-full p-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm resize-none custom-scrollbar transition-colors"
                    />
                  </div>

                  {/* Spoilers, Rewatch, and Like Toggles */}
                  <div className="flex flex-wrap items-center gap-5 pt-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setContainsSpoilers(!containsSpoilers)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
                          containsSpoilers ? 'bg-red-500' : 'bg-[#273442]'
                        }`}
                      >
                        <span className="sr-only">Contains spoilers</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            containsSpoilers ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-[#9AA8B7]">Contains spoilers</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsRewatch(!isRewatch)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
                          isRewatch ? 'bg-[#35D6A0]' : 'bg-[#273442]'
                        }`}
                      >
                        <span className="sr-only">Rewatch</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-[#0B0F14] shadow ring-0 transition duration-200 ease-in-out ${
                            isRewatch ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-[#9AA8B7]">I&apos;ve watched this before</span>
                    </div>

                    {/* Like / Heart */}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setLiked(!liked)}
                        className="p-1 rounded-lg hover:bg-[#1A2430] transition-colors"
                        aria-label={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          size={18}
                          className={`transition-colors ${
                            liked
                              ? 'fill-red-500 text-red-500'
                              : 'text-[#9AA8B7] hover:text-red-400'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium text-[#9AA8B7]">Like</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">
                      Tags <span className="normal-case font-normal text-[#9AA8B7]/70">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. cinema, 1990s, mind-bending"
                      className="w-full h-10 px-3.5 bg-[#0B0F14] border border-[#273442] rounded-xl text-[#F4F3EC] placeholder:text-[#9AA8B7]/60 focus:border-[#35D6A0] focus:outline-none focus:ring-1 focus:ring-[#35D6A0] text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#273442] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-[#9AA8B7] hover:text-[#F4F3EC] bg-[#1A2430] hover:bg-[#222E3D] border border-[#273442] rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-[#0B0F14] bg-[#35D6A0] hover:bg-[#6BE8BC] rounded-xl transition-colors disabled:opacity-50 shadow-sm"
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
