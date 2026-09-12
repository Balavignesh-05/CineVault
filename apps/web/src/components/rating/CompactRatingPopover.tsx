'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface CompactRatingPopoverProps {
  movieId: number;
  movieTitle: string;
  mediaType?: 'movie' | 'tv';
  children: React.ReactNode; // The trigger button
}

export function CompactRatingPopover({ movieId, movieTitle, mediaType = 'movie', children }: CompactRatingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const apiPath = mediaType === 'tv' ? `/ratings/series/${movieId}` : `/ratings/film/${movieId}`;

  // Fetch current rating
  const { data: ratingData } = useQuery({
    queryKey: ['user-rating', movieId],
    queryFn: () => api.get<{ data: { userRating: number | null } }>(apiPath).then(res => ({ data: { rating: res.data?.userRating } })).catch(() => ({ data: { rating: null } })),
    enabled: isOpen,
  });

  const currentRating = ratingData?.data?.rating ?? null;

  // Set rating mutation
  const setRating = useMutation({
    mutationFn: (rating: number) => api.post(apiPath, { rating }),
    onMutate: async (newRating) => {
      await queryClient.cancelQueries({ queryKey: ['user-rating', movieId] });
      const previous = queryClient.getQueryData(['user-rating', movieId]);
      queryClient.setQueryData(['user-rating', movieId], { data: { rating: newRating } });
      return { previous };
    },
    onSuccess: (_, rating) => {
      toast.success(`Rated ${movieTitle} ${rating}/10`, { icon: '⭐' });
      setIsOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
    },
    onError: () => toast.error('Failed to save rating'),
  });

  const removeMutation = useMutation({
    mutationFn: () => api.delete(apiPath),
    onSuccess: () => {
      toast.success('Rating removed');
      queryClient.invalidateQueries({ queryKey: ['user-rating', movieId] });
      setIsOpen(false);
    },
    onError: () => toast.error('Failed to remove rating'),
  });

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const HALF_STARS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  // Map to /10 internally
  const toTen = (s: number) => s * 2;
  const toFive = (s: number) => s / 2;

  const displayRating = hovered !== null ? hovered : (currentRating !== null ? toFive(currentRating) : null);

  function getStarFill(starIndex: number, rating: number | null): 'full' | 'half' | 'empty' {
    if (rating === null) return 'empty';
    if (rating >= starIndex + 1) return 'full';
    if (rating >= starIndex + 0.5) return 'half';
    return 'empty';
  }

  const label = displayRating !== null ? [
    '', 'Atrocious', 'Terrible', 'Bad', 'Poor', 'Average',
    'Fine', 'Good', 'Great', 'Excellent', 'Masterpiece'
  ][Math.round(displayRating * 2)] || '' : '';

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(prev => !prev)} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 bg-surface border border-border-subtle rounded-2xl shadow-2xl p-4 w-[260px]"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rate this film</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-elevated"
              >
                <X size={14} />
              </button>
            </div>

            {/* Half-star grid */}
            <div
              className="relative flex items-center justify-center gap-1 py-2"
              onMouseLeave={() => setHovered(null)}
            >
              {[0, 1, 2, 3, 4].map(starIdx => (
                <div key={starIdx} className="relative w-9 h-9 flex items-center justify-center">
                  {/* Star background */}
                  <Star
                    size={28}
                    className="absolute"
                    style={{
                      fill: getStarFill(starIdx, displayRating) !== 'empty' ? '#ff8000' : 'transparent',
                      stroke: getStarFill(starIdx, displayRating) !== 'empty' ? '#ff8000' : '#2c3440',
                      clipPath: getStarFill(starIdx, displayRating) === 'half' ? 'inset(0 50% 0 0)' : undefined,
                    }}
                  />
                  {getStarFill(starIdx, displayRating) === 'half' && (
                    <Star
                      size={28}
                      className="absolute"
                      style={{ fill: 'transparent', stroke: '#2c3440' }}
                    />
                  )}
                  {/* Left half hover zone */}
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full cursor-pointer"
                    onMouseEnter={() => setHovered(starIdx + 0.5)}
                    onClick={() => setRating.mutate(toTen(starIdx + 0.5))}
                  />
                  {/* Right half hover zone */}
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full cursor-pointer"
                    onMouseEnter={() => setHovered(starIdx + 1)}
                    onClick={() => setRating.mutate(toTen(starIdx + 1))}
                  />
                </div>
              ))}
            </div>

            {/* Label */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="h-5 flex items-center justify-center">
                {displayRating !== null ? (
                  <p className="text-xs font-bold text-accent-amber">
                    {displayRating} / 5 — {label}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">Hover to rate</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    if (hovered) setRating.mutate(hovered);
                  }}
                  disabled={hovered === null || setRating.isPending}
                >
                  {setRating.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                </Button>
                {currentRating !== null && (
                  <Button 
                    size="icon" 
                    variant="destructive"
                    className="w-9 shrink-0"
                    onClick={() => removeMutation.mutate()}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </Button>
                )}
              </div>
            </div>

            {setRating.isError && (
              <div className="absolute inset-0 bg-[#14171B]/80 rounded-2xl flex items-center justify-center">
                <p className="text-xs text-red-500">Failed to save</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
