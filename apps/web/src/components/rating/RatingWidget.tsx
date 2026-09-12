'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Star, StarHalf, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RatingWidgetProps {
  tmdbId: number;
  filmTitle: string;
  onRated?: () => void;
}

export function RatingWidget({ tmdbId, filmTitle, onRated }: RatingWidgetProps) {
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { data: currentRating, isLoading } = useQuery({
    queryKey: ['rating', tmdbId],
    queryFn: () => api.get<{ data: { userRating: number | null } }>(`/ratings/film/${tmdbId}`).then(res => res.data?.userRating).catch(() => null)
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) => api.post(`/ratings/film/${tmdbId}`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', tmdbId] });
      toast.success(`Rated ${filmTitle}`);
      onRated?.();
    },
    onError: () => {
      toast.error('Failed to rate film');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/ratings/film/${tmdbId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', tmdbId] });
      toast.success('Rating removed');
    }
  });

  const activeRating = hoverRating !== null ? hoverRating : currentRating;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    setHoverRating(percent < 0.5 ? index + 0.5 : index + 1);
  };

  if (isLoading) return <div className="h-10 w-48 animate-pulse bg-muted rounded" />;

  return (
    <div className="flex flex-col items-center gap-4">
      {!currentRating && <p className="text-muted-foreground">Rate this film</p>}
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
        {[...Array(5)].map((_, i) => {
          const isFilled = activeRating && activeRating >= i + 1;
          const isHalf = activeRating && activeRating === i + 0.5;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2 }}
              className="cursor-pointer relative text-[#3D3D55]"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={() => {
                if (hoverRating) rateMutation.mutate(hoverRating);
              }}
            >
              <Star className={`w-8 h-8 ${isFilled ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : ''}`} />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-8 h-8 fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {currentRating && (
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Your rating: ★ {currentRating}</p>
          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate()}>
            <Trash2 className="w-4 h-4 text-error" />
          </Button>
        </div>
      )}
    </div>
  );
}
