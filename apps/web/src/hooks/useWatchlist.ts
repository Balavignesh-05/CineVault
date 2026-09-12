'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getWatchlist, checkWatchlistStatus, addToWatchlist, updateWatchlistStatus, removeFromWatchlist } from '@/lib/api/watchlist';
import type { WatchlistStatus } from '@cinevault/shared-types';

export function useWatchlist(params?: { status?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: socialQueryKeys.watchlist.list(params),
    queryFn: () => getWatchlist(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWatchlistStatus(tmdbId: number | undefined) {
  return useQuery({
    queryKey: socialQueryKeys.watchlist.status(tmdbId!),
    queryFn: () => checkWatchlistStatus(tmdbId!),
    enabled: !!tmdbId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filmId, status }: { filmId: string; status?: WatchlistStatus }) => addToWatchlist(filmId, status),
    onSuccess: (_, { filmId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.watchlist.list() });
    },
  });
}

export function useUpdateWatchlistStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filmId, status }: { filmId: string; status: WatchlistStatus }) => updateWatchlistStatus(filmId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.watchlist.list() });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filmId: string) => removeFromWatchlist(filmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.watchlist.list() });
    },
  });
}
