'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/rating/StarRating';

interface RatingWidgetProps {
  tmdbId: number;
  filmTitle: string;
  onRated?: () => void;
}

export function RatingWidget({ tmdbId, filmTitle, onRated }: RatingWidgetProps) {
  const queryClient = useQueryClient();

  const { data: currentRating, isLoading } = useQuery({
    queryKey: ['rating', tmdbId],
    queryFn: () =>
      api
        .get<{ data: { userRating: number | null } }>(`/ratings/film/${tmdbId}`)
        .then((res) => res.data?.userRating)
        .catch(() => null),
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) => api.post(`/ratings/film/${tmdbId}`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', tmdbId] });
      toast.success(`Rated ${filmTitle}`);
      onRated?.();
    },
    onError: () => {
      toast.error('Failed to rate film');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/ratings/film/${tmdbId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', tmdbId] });
      toast.success('Rating removed');
    },
  });

  if (isLoading) return <div className="h-10 w-48 animate-pulse bg-[#1A2430] rounded-xl" />;

  const handleRatingChange = (newRating: number) => {
    if (newRating > 0) {
      rateMutation.mutate(newRating);
    } else {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {!currentRating && (
        <p className="text-xs font-bold text-[#9AA8B7] uppercase tracking-wider">Rate this film</p>
      )}
      <div className="flex items-center px-4 py-2 bg-[#0B0F14] rounded-xl border border-[#273442]">
        <StarRating
          value={currentRating || 0}
          onChange={handleRatingChange}
          size="lg"
          allowHalf={true}
          showLabel={true}
        />
      </div>
      {currentRating && (
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[#F4F3EC]">Your rating: {currentRating} ★</p>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            onClick={() => deleteMutation.mutate()}
            aria-label="Remove rating"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
