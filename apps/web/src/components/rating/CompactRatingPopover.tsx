'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/rating/StarRating';

interface CompactRatingPopoverProps {
  movieId: number;
  movieTitle: string;
  mediaType?: 'movie' | 'tv';
  children: React.ReactNode;
}

export function CompactRatingPopover({
  movieId,
  movieTitle,
  mediaType = 'movie',
  children,
}: CompactRatingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localRating, setLocalRating] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const apiPath = mediaType === 'tv' ? `/ratings/series/${movieId}` : `/ratings/film/${movieId}`;

  // Fetch current rating (0-10)
  const { data: ratingData } = useQuery({
    queryKey: ['user-rating', movieId],
    queryFn: () =>
      api
        .get<{ data: { userRating: number | null } }>(apiPath)
        .then((res) => ({ data: { rating: res.data?.userRating } }))
        .catch(() => ({ data: { rating: null } })),
    enabled: isOpen,
  });

  const rawRating = ratingData?.data?.rating ?? null;
  const currentFiveStar = rawRating !== null ? rawRating / 2 : 0;

  useEffect(() => {
    if (rawRating !== null) {
      setLocalRating(rawRating / 2);
    }
  }, [rawRating]);

  // Set rating mutation (0-10)
  const setRating = useMutation({
    mutationFn: (ratingInTen: number) => api.post(apiPath, { rating: ratingInTen }),
    onSuccess: (_, ratingInTen) => {
      toast.success(`Rated ${movieTitle} ${(ratingInTen / 2).toFixed(1)} / 5 ★`);
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
      setLocalRating(0);
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

  const handleRatingChange = (newVal: number) => {
    setLocalRating(newVal);
    if (newVal > 0) {
      setRating.mutate(newVal * 2);
    } else {
      removeMutation.mutate();
    }
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 bg-[#131A22] border border-[#273442] rounded-2xl shadow-2xl p-4 w-[280px]"
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#273442] pb-2">
              <p className="text-xs font-black text-[#F4F3EC] uppercase tracking-wider">
                Rate this {mediaType === 'tv' ? 'series' : 'film'}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#9AA8B7] hover:text-[#F4F3EC] transition-colors p-1 rounded-md hover:bg-[#1A2430]"
                aria-label="Close popover"
              >
                <X size={14} />
              </button>
            </div>

            {/* Unified 5-Star Row */}
            <div className="flex items-center justify-center py-2.5 bg-[#0B0F14] rounded-xl border border-[#273442]">
              <StarRating
                value={localRating || currentFiveStar}
                onChange={handleRatingChange}
                size="md"
                allowHalf={true}
                showLabel={true}
              />
            </div>

            {/* Actions & Status */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#273442]">
              <span className="text-[11px] text-[#9AA8B7] truncate">
                {rawRating !== null ? `Current: ${(rawRating / 2).toFixed(1)} ★` : 'Not rated yet'}
              </span>

              {rawRating !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => removeMutation.mutate()}
                  disabled={removeMutation.isPending}
                >
                  {removeMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <Trash2 size={12} className="mr-1" />
                  )}
                  Remove
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
