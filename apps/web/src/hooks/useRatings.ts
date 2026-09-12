'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getFilmRatingStats, rateFilm, deleteRating } from '@/lib/api/ratings';
import type { FilmRatingStats } from '@cinevault/shared-types';

export function useFilmRatingStats(tmdbId: number) {
  return useQuery({
    queryKey: socialQueryKeys.ratings.film(tmdbId),
    queryFn: () => getFilmRatingStats(tmdbId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRateFilm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tmdbId, rating }: { tmdbId: number; rating: number }) => rateFilm(tmdbId, rating),
    onSuccess: (_, { tmdbId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.ratings.film(tmdbId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.activity.feed() });
    },
  });
}

export function useDeleteRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tmdbId: number) => deleteRating(tmdbId),
    onSuccess: (_, tmdbId) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.ratings.film(tmdbId) });
    },
  });
}
