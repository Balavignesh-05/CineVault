'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, RotateCcw, Tag, Check, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface DiaryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  releaseYear?: number | null;
}

export function DiaryEntryModal({
  isOpen,
  onClose,
  movieId,
  movieTitle,
  posterPath,
  releaseYear,
}: DiaryEntryModalProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [watchedDate, setWatchedDate] = useState(today);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isRewatch, setIsRewatch] = useState(false);
  const [tags, setTags] = useState('');

  const logMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/logs', data),
    onSuccess: () => {
      toast.success(`Logged: ${movieTitle}!`, {
        description: 'Added to your film diary.',
        icon: '🎬',
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['film-liked', movieId] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to log film', { description: 'Please try again.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to log films');
      return;
    }
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    logMutation.mutate({
      tmdbId: movieId,
      watchedDate: watchedDate || null,
      rating: rating > 0 ? rating : null,
      liked: false,
      isRewatch,
      notes: notes.trim() || null,
      tags: tagList,
    });
  };

  const displayRating = hoveredRating || rating;

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
              className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-5 border-b border-border-subtle">
                {posterPath ? (
                  <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                    <Image src={`https://image.tmdb.org/t/p/w92${posterPath}`} alt={movieTitle} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-14 bg-elevated rounded flex items-center justify-center">
                    <Film size={16} className="text-text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white line-clamp-1">{movieTitle}</h2>
                  {releaseYear && <p className="text-xs text-text-muted font-mono">{releaseYear}</p>}
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-elevated">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Rating</label>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star size={28} className={`transition-colors ${star <= displayRating ? 'text-accent-amber fill-[#ff8000]' : 'text-[#2c3440]'}`} />
                      </button>
                    ))}
                    {rating > 0 && (
                      <button type="button" onClick={() => setRating(0)} className="ml-2 text-xs text-text-muted hover:text-white transition-colors">Clear</button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="diary-date" className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Date Watched
                  </label>
                  <input
                    id="diary-date"
                    type="date"
                    value={watchedDate}
                    onChange={(e) => setWatchedDate(e.target.value)}
                    max={today}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-subtle text-white text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="diary-notes" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Notes</label>
                  <textarea
                    id="diary-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you think?"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-subtle text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="diary-tags" className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={12} /> Tags (comma separated)
                  </label>
                  <input
                    id="diary-tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="thriller, masterpiece, rewatch"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border-subtle text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsRewatch(prev => !prev)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${isRewatch ? 'bg-[#40bcf4]/10 border-[#40bcf4]/40 text-[#40bcf4]' : 'bg-background border-border-subtle text-text-secondary hover:border-[#40bcf4]/30'}`}
                >
                  <RotateCcw size={16} />
                  <span className="text-sm font-medium">This is a rewatch</span>
                  {isRewatch && <Check size={14} className="ml-auto" />}
                </button>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border-subtle bg-transparent text-text-secondary hover:bg-elevated hover:text-white">Cancel</Button>
                  <Button type="submit" disabled={logMutation.isPending} className="flex-1 bg-primary hover:bg-[#00c048] text-[#14181c] font-bold">
                    {logMutation.isPending ? 'Logging...' : 'Log Film'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
